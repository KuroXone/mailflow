import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { CreateCampaignDto, UpdateCampaignDto, ScheduleCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService, private queue: QueueService) {}

  async findAll(orgId: string, query: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = query;
    const where: any = { orgId };
    if (status) where.status = status;
    if (search) where.OR = [
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

  async findOne(id: string, orgId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, orgId },
      include: { analytics: true, abTests: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(orgId: string, dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: { orgId, ...dto } as any,
    });
  }

  async update(id: string, orgId: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOne(id, orgId);
    if (['SENDING', 'SENT'].includes(campaign.status)) {
      throw new BadRequestException('Cannot edit a campaign that is sending or sent');
    }
    return this.prisma.campaign.update({ where: { id }, data: dto });
  }

  async duplicate(id: string, orgId: string) {
    const campaign = await this.findOne(id, orgId);
    const { id: _id, analytics, abTests, org, createdAt, updatedAt, sentAt, completedAt, ...rest } = campaign as any;
    return this.prisma.campaign.create({
      data: { ...rest, name: `Copy of ${campaign.name}`, status: 'DRAFT' },
    });
  }

  async schedule(id: string, orgId: string, dto: ScheduleCampaignDto) {
    const campaign = await this.findOne(id, orgId);
    if (campaign.status !== 'DRAFT') throw new BadRequestException('Campaign must be in DRAFT status');
    if (new Date(dto.scheduledAt) <= new Date()) throw new BadRequestException('Scheduled time must be in the future');

    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'SCHEDULED', scheduledAt: new Date(dto.scheduledAt) },
    });
  }

  async send(id: string, orgId: string) {
    const campaign = await this.findOne(id, orgId);
    if (!['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status)) {
      throw new BadRequestException('Campaign cannot be sent in its current state');
    }
    if (!campaign.listIds.length) throw new BadRequestException('No contact lists selected');
    if (!campaign.subject) throw new BadRequestException('Subject is required');
    if (!campaign.htmlContent) throw new BadRequestException('Email content is required');

    await this.prisma.campaign.update({ where: { id }, data: { status: 'SENDING' } });
    await this.queue.enqueueCampaign(id, orgId);
    return { message: 'Campaign queued for sending' };
  }

  async pause(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.campaign.update({ where: { id }, data: { status: 'PAUSED' } });
  }

  async delete(id: string, orgId: string) {
    const campaign = await this.findOne(id, orgId);
    if (campaign.status === 'SENDING') throw new BadRequestException('Cannot delete a campaign that is currently sending');
    await this.prisma.campaign.delete({ where: { id } });
    return { message: 'Campaign deleted' };
  }

  async getStats(orgId: string) {
    const [total, sent, scheduled, drafts] = await Promise.all([
      this.prisma.campaign.count({ where: { orgId } }),
      this.prisma.campaign.count({ where: { orgId, status: 'SENT' } }),
      this.prisma.campaign.count({ where: { orgId, status: 'SCHEDULED' } }),
      this.prisma.campaign.count({ where: { orgId, status: 'DRAFT' } }),
    ]);
    return { total, sent, scheduled, drafts };
  }
}
