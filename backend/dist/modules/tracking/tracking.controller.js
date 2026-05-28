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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
let TrackingController = class TrackingController {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async trackOpen(trackingId, req, res) {
        await this.queue.trackEvent({
            type: 'open',
            trackingId,
            metadata: {
                userAgent: req.headers['user-agent'],
                ip: req.ip,
            },
        });
        res.set({ 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache' });
        res.send(PIXEL);
    }
    async trackClick(trackingId, url, req, res) {
        if (!url)
            return res.status(400).send('Missing url');
        await this.queue.trackEvent({
            type: 'click',
            trackingId,
            metadata: { url, userAgent: req.headers['user-agent'], ip: req.ip },
        });
        res.redirect(decodeURIComponent(url));
    }
    async unsubscribe(trackingId, res) {
        const log = await this.prisma.emailLog.findUnique({ where: { trackingId } });
        if (log) {
            await this.prisma.contact.updateMany({
                where: { id: log.contactId },
                data: { status: 'UNSUBSCRIBED' },
            });
            await this.prisma.emailLog.update({
                where: { trackingId },
                data: { status: 'UNSUBSCRIBED' },
            });
            await this.prisma.campaignAnalytics.update({
                where: { campaignId: log.campaignId },
                data: { unsubscribed: { increment: 1 } },
            });
        }
        res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2>✓ You've been unsubscribed</h2>
      <p>You will no longer receive emails from this sender.</p>
    </body></html>`);
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('open/:trackingId'),
    __param(0, (0, common_1.Param)('trackingId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackOpen", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('click/:trackingId'),
    __param(0, (0, common_1.Param)('trackingId')),
    __param(1, (0, common_1.Query)('url')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackClick", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('unsubscribe/:trackingId'),
    __param(0, (0, common_1.Param)('trackingId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "unsubscribe", null);
exports.TrackingController = TrackingController = __decorate([
    (0, swagger_1.ApiTags)('tracking'),
    (0, common_1.Controller)('tracking'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, queue_service_1.QueueService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map