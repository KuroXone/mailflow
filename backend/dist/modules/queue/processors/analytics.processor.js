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
var AnalyticsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AnalyticsProcessor = AnalyticsProcessor_1 = class AnalyticsProcessor {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AnalyticsProcessor_1.name);
    }
    async handleTrackEvent(job) {
        const { type, trackingId, metadata } = job.data;
        const log = await this.prisma.emailLog.findUnique({ where: { trackingId } });
        if (!log)
            return;
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
            }
            else if (type === 'click') {
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
            }
            else if (type === 'bounce') {
                await this.prisma.emailLog.update({
                    where: { trackingId },
                    data: { status: 'BOUNCED', bouncedAt: new Date() },
                });
                await this.prisma.campaignAnalytics.update({
                    where: { campaignId: log.campaignId },
                    data: { bounced: { increment: 1 } },
                });
            }
            else if (type === 'complaint') {
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
        }
        catch (err) {
            this.logger.error(`Failed to track ${type} event for ${trackingId}: ${err.message}`);
            throw err;
        }
    }
};
exports.AnalyticsProcessor = AnalyticsProcessor;
__decorate([
    (0, bull_1.Process)('track-event'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsProcessor.prototype, "handleTrackEvent", null);
exports.AnalyticsProcessor = AnalyticsProcessor = AnalyticsProcessor_1 = __decorate([
    (0, bull_1.Processor)('analytics'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsProcessor);
//# sourceMappingURL=analytics.processor.js.map