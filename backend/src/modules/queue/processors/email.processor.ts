import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Processor('email-sending')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private prisma: PrismaService, private config: ConfigService) {}

  @Process('send-campaign')
  async handleCampaign(job: Job<{ campaignId: string; orgId: string }>) {
    const { campaignId, orgId } = job.data;
    this.logger.log(`Processing campaign ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { analytics: true },
    });
    if (!campaign) return;

    // Update status
    await this.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'SENDING' } });

    // Get contacts from all lists
    const contacts = await this.prisma.contactListMember.findMany({
      where: { listId: { in: campaign.listIds } },
      include: { contact: true },
    });

    const uniqueContacts = [...new Map(contacts.map(c => [c.contactId, c.contact])).values()]
      .filter(c => c.status === 'SUBSCRIBED');

    // Update recipient count
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { totalRecipients: uniqueContacts.length },
    });

    // Ensure analytics row
    if (!campaign.analytics) {
      await this.prisma.campaignAnalytics.create({ data: { campaignId } });
    }

    // Get SMTP config
    const smtp = await this.prisma.smtpConfig.findFirst({
      where: { orgId, isActive: true, isDefault: true },
    }) || await this.prisma.smtpConfig.findFirst({ where: { orgId, isActive: true } });

    if (!smtp) {
      await this.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'PAUSED' } });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.authUser, pass: smtp.authPass },
    });

    let sent = 0;
    const trackingDomain = this.config.get('trackingDomain');

    for (const contact of uniqueContacts) {
      try {
        // Create email log
        const log = await this.prisma.emailLog.create({
          data: { orgId, campaignId, contactId: contact.id, status: 'SENDING', smtpConfigId: smtp.id },
        });

        // Inject tracking pixel + rewrite links
        let html = campaign.htmlContent || '';
        if (campaign.trackOpens) {
          html += `<img src="${trackingDomain}/tracking/open/${log.trackingId}" width="1" height="1" style="display:none" />`;
        }
        if (campaign.trackClicks) {
          html = html.replace(
            /href="(https?:\/\/[^"]+)"/g,
            (_, url) => `href="${trackingDomain}/tracking/click/${log.trackingId}?url=${encodeURIComponent(url)}"`,
          );
        }

        // Personalize
        html = this.personalize(html, contact);
        const subject = this.personalize(campaign.subject, contact);

        await transporter.sendMail({
          from: `"${campaign.fromName}" <${campaign.fromEmail}>`,
          to: contact.email,
          replyTo: campaign.replyTo,
          subject,
          html,
          text: campaign.textContent || undefined,
        });

        await this.prisma.emailLog.update({
          where: { id: log.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        sent++;
        await this.prisma.campaignAnalytics.update({
          where: { campaignId },
          data: { sent: { increment: 1 }, delivered: { increment: 1 } },
        });

      } catch (err) {
        this.logger.error(`Failed to send to ${contact.email}: ${err.message}`);
        await this.prisma.campaignAnalytics.update({
          where: { campaignId },
          data: { failed: { increment: 1 } },
        });
      }

      await new Promise(r => setTimeout(r, 50)); // rate limit
    }

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'SENT', sentAt: new Date(), completedAt: new Date() },
    });

    this.logger.log(`Campaign ${campaignId} completed. Sent: ${sent}/${uniqueContacts.length}`);
  }

  private personalize(text: string, contact: any): string {
    return text
      .replace(/{{first_name}}/gi, contact.firstName || '')
      .replace(/{{last_name}}/gi, contact.lastName || '')
      .replace(/{{email}}/gi, contact.email || '')
      .replace(/{{full_name}}/gi, `${contact.firstName || ''} ${contact.lastName || ''}`.trim());
  }
}
