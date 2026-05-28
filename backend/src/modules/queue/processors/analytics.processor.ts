import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('track-event')
  async handleTrackEvent(job: Job<{
    type: 'open' | 'click' | 'bounce' | 'complaint';
    trackingId: string;
    metadata?: Record<string, any>;
  }>) {
    const { type, trackingId, metadata } = job.data;

    const log = await this.prisma.emailLog.findUnique({ where: { trackingId } });
    if (!log) return;

    try {
      if (type === 'open') {
        await this.prisma.emailLog.update({
          where: { trackingId },
          data: {
            status: 'OPENED',
            openedAt: log.openedAt || new Date(),
            opens: { increment: 1 },
            userAgent: metadata?.userAgent || log.userAgent,
          },
        });
        await this.prisma.campaignAnalytics.update({
          where: { campaignId: log.campaignId },
          data: {
            opened: { increment: 1 },
            ...(log.opens === 0 && { uniqueOpens: { increment: 1 } }),
          },
        });
      } else if (type === 'click') {
        const url = metadata?.url;
        await this.prisma.emailLog.update({
          where: { trackingId },
          data: {
            status: 'CLICKED',
            clickedAt: log.clickedAt || new Date(),
            clicks: { increment: 1 },
          },
        });
        if (url) {
          await this.prisma.linkClick.create({
            data: { emailLogId: log.id, url, userAgent: metadata?.userAgent },
          });
        }
        await this.prisma.campaignAnalytics.update({
          where: { campaignId: log.campaignId },
          data: {
            clicked: { increment: 1 },
            ...(log.clicks === 0 && { uniqueClicks: { increment: 1 } }),
          },
        });
      } else if (type === 'bounce') {
        await this.prisma.emailLog.update({
          where: { trackingId },
          data: { status: 'BOUNCED', bouncedAt: new Date() },
        });
        await this.prisma.campaignAnalytics.update({
          where: { campaignId: log.campaignId },
          data: { bounced: { increment: 1 } },
        });
      } else if (type === 'complaint') {
        await this.prisma.emailLog.update({
          where: { trackingId },
          data: { status: 'COMPLAINED' },
        });
        await this.prisma.campaignAnalytics.update({
          where: { campaignId: log.campaignId },
          data: { complained: { increment: 1 } },
        });
        await this.prisma.contact.update({
          where: { id: log.contactId },
          data: { status: 'COMPLAINED' },
        });
      }
    } catch (err) {
      this.logger.error(`Failed to track ${type} event for ${trackingId}: ${err.message}`);
      throw err;
    }
  }
}
