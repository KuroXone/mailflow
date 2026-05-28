"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const prisma_service_1 = require("../../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let EmailProcessor = EmailProcessor_1 = class EmailProcessor {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(EmailProcessor_1.name);
    }
    async handleCampaign(job) {
        const { campaignId, orgId } = job.data;
        this.logger.log(`Processing campaign ${campaignId}`);
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { analytics: true },
        });
        if (!campaign)
            return;
        await this.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'SENDING' } });
        const contacts = await this.prisma.contactListMember.findMany({
            where: { listId: { in: campaign.listIds } },
            include: { contact: true },
        });
        const uniqueContacts = [...new Map(contacts.map(c => [c.contactId, c.contact])).values()]
            .filter(c => c.status === 'SUBSCRIBED');
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { totalRecipients: uniqueContacts.length },
        });
        if (!campaign.analytics) {
            await this.prisma.campaignAnalytics.create({ data: { campaignId } });
        }
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
                const log = await this.prisma.emailLog.create({
                    data: { orgId, campaignId, contactId: contact.id, status: 'SENDING', smtpConfigId: smtp.id },
                });
                let html = campaign.htmlContent || '';
                if (campaign.trackOpens) {
                    html += `<img src="${trackingDomain}/tracking/open/${log.trackingId}" width="1" height="1" style="display:none" />`;
                }
                if (campaign.trackClicks) {
                    html = html.replace(/href="(https?:\/\/[^"]+)"/g, (_, url) => `href="${trackingDomain}/tracking/click/${log.trackingId}?url=${encodeURIComponent(url)}"`);
                }
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
            }
            catch (err) {
                this.logger.error(`Failed to send to ${contact.email}: ${err.message}`);
                await this.prisma.campaignAnalytics.update({
                    where: { campaignId },
                    data: { failed: { increment: 1 } },
                });
            }
            await new Promise(r => setTimeout(r, 50));
        }
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'SENT', sentAt: new Date(), completedAt: new Date() },
        });
        this.logger.log(`Campaign ${campaignId} completed. Sent: ${sent}/${uniqueContacts.length}`);
    }
    personalize(text, contact) {
        return text
            .replace(/{{first_name}}/gi, contact.firstName || '')
            .replace(/{{last_name}}/gi, contact.lastName || '')
            .replace(/{{email}}/gi, contact.email || '')
            .replace(/{{full_name}}/gi, `${contact.firstName || ''} ${contact.lastName || ''}`.trim());
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)('send-campaign'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleCampaign", null);
exports.EmailProcessor = EmailProcessor = EmailProcessor_1 = __decorate([
    (0, bull_1.Processor)('email-sending'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map