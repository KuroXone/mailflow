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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let CampaignsService = class CampaignsService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async findAll(orgId, query) {
        const { page = 1, limit = 20, status, search } = query;
        const where = { orgId };
        if (status)
            where.status = status;
        if (search)
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
            ];
        const [items, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where, skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { analytics: true },
            }),
            this.prisma.campaign.count({ where }),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, orgId },
            include: { analytics: true, abTests: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async create(orgId, dto) {
        return this.prisma.campaign.create({
            data: { orgId, ...dto },
        });
    }
    async update(id, orgId, dto) {
        const campaign = await this.findOne(id, orgId);
        if (['SENDING', 'SENT'].includes(campaign.status)) {
            throw new common_1.BadRequestException('Cannot edit a campaign that is sending or sent');
        }
        return this.prisma.campaign.update({ where: { id }, data: dto });
    }
    async duplicate(id, orgId) {
        const campaign = await this.findOne(id, orgId);
        const { id: _id, analytics, abTests, org, createdAt, updatedAt, sentAt, completedAt, ...rest } = campaign;
        return this.prisma.campaign.create({
            data: { ...rest, name: `Copy of ${campaign.name}`, status: 'DRAFT' },
        });
    }
    async schedule(id, orgId, dto) {
        const campaign = await this.findOne(id, orgId);
        if (campaign.status !== 'DRAFT')
            throw new common_1.BadRequestException('Campaign must be in DRAFT status');
        if (new Date(dto.scheduledAt) <= new Date())
            throw new common_1.BadRequestException('Scheduled time must be in the future');
        return this.prisma.campaign.update({
            where: { id },
            data: { status: 'SCHEDULED', scheduledAt: new Date(dto.scheduledAt) },
        });
    }
    async send(id, orgId) {
        const campaign = await this.findOne(id, orgId);
        if (!['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status)) {
            throw new common_1.BadRequestException('Campaign cannot be sent in its current state');
        }
        if (!campaign.listIds.length)
            throw new common_1.BadRequestException('No contact lists selected');
        if (!campaign.subject)
            throw new common_1.BadRequestException('Subject is required');
        if (!campaign.htmlContent)
            throw new common_1.BadRequestException('Email content is required');
        await this.prisma.campaign.update({ where: { id }, data: { status: 'SENDING' } });
        await this.queue.enqueueCampaign(id, orgId);
        return { message: 'Campaign queued for sending' };
    }
    async pause(id, orgId) {
        await this.findOne(id, orgId);
        return this.prisma.campaign.update({ where: { id }, data: { status: 'PAUSED' } });
    }
    async delete(id, orgId) {
        const campaign = await this.findOne(id, orgId);
        if (campaign.status === 'SENDING')
            throw new common_1.BadRequestException('Cannot delete a campaign that is currently sending');
        await this.prisma.campaign.delete({ where: { id } });
        return { message: 'Campaign deleted' };
    }
    async getStats(orgId) {
        const [total, sent, scheduled, drafts] = await Promise.all([
            this.prisma.campaign.count({ where: { orgId } }),
            this.prisma.campaign.count({ where: { orgId, status: 'SENT' } }),
            this.prisma.campaign.count({ where: { orgId, status: 'SCHEDULED' } }),
            this.prisma.campaign.count({ where: { orgId, status: 'DRAFT' } }),
        ]);
        return { total, sent, scheduled, drafts };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, queue_service_1.QueueService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map