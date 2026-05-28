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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(orgId) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [campaigns, totalSent, totalContacts, recentCampaigns] = await Promise.all([
            this.prisma.campaign.count({ where: { orgId } }),
            this.prisma.campaignAnalytics.aggregate({
                where: { campaign: { orgId } },
                _sum: { sent: true, opened: true, clicked: true, bounced: true },
            }),
            this.prisma.contact.count({ where: { orgId, status: 'SUBSCRIBED' } }),
            this.prisma.campaign.findMany({
                where: { orgId, status: 'SENT' },
                orderBy: { sentAt: 'desc' },
                take: 5,
                include: { analytics: true },
            }),
        ]);
        const sent = totalSent._sum.sent || 0;
        const opened = totalSent._sum.opened || 0;
        const clicked = totalSent._sum.clicked || 0;
        const bounced = totalSent._sum.bounced || 0;
        return {
            overview: {
                totalCampaigns: campaigns,
                totalContacts,
                emailsSent: sent,
                deliveryRate: sent ? Math.round(((sent - bounced) / sent) * 100 * 10) / 10 : 0,
                openRate: sent ? Math.round((opened / sent) * 100 * 10) / 10 : 0,
                clickRate: sent ? Math.round((clicked / sent) * 100 * 10) / 10 : 0,
                bounceRate: sent ? Math.round((bounced / sent) * 100 * 10) / 10 : 0,
            },
            recentCampaigns,
        };
    }
    async getCampaignAnalytics(campaignId, orgId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, orgId },
            include: {
                analytics: true,
                emailLogs: {
                    where: { status: { in: ['OPENED', 'CLICKED'] } },
                    orderBy: { openedAt: 'desc' },
                    take: 100,
                },
            },
        });
        if (!campaign)
            return null;
        const logs = await this.prisma.emailLog.findMany({
            where: { campaignId, device: { not: null } },
            select: { device: true },
        });
        const deviceMap = {};
        logs.forEach(l => { if (l.device)
            deviceMap[l.device] = (deviceMap[l.device] || 0) + 1; });
        const countryLogs = await this.prisma.emailLog.findMany({
            where: { campaignId, country: { not: null } },
            select: { country: true },
        });
        const countryMap = {};
        countryLogs.forEach(l => { if (l.country)
            countryMap[l.country] = (countryMap[l.country] || 0) + 1; });
        const topLinks = await this.prisma.linkClick.groupBy({
            by: ['url'],
            where: { emailLog: { campaignId } },
            _count: { url: true },
            orderBy: { _count: { url: 'desc' } },
            take: 10,
        });
        return {
            campaign,
            devices: Object.entries(deviceMap).map(([device, count]) => ({ device, count })),
            countries: Object.entries(countryMap).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10),
            topLinks: topLinks.map(l => ({ url: l.url, clicks: l._count.url })),
        };
    }
    async getTimeline(orgId, days = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const logs = await this.prisma.emailLog.findMany({
            where: { orgId, sentAt: { gte: since } },
            select: { sentAt: true, openedAt: true, clickedAt: true, status: true },
        });
        const byDay = {};
        logs.forEach(log => {
            const day = log.sentAt?.toISOString().split('T')[0];
            if (!day)
                return;
            if (!byDay[day])
                byDay[day] = { sent: 0, opens: 0, clicks: 0 };
            byDay[day].sent++;
            if (log.openedAt)
                byDay[day].opens++;
            if (log.clickedAt)
                byDay[day].clicks++;
        });
        return Object.entries(byDay)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map