import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.automation.findMany({
      where: { orgId },
      include: {
        _count: { select: { runs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const automation = await this.prisma.automation.findFirst({ where: { id, orgId } });
    if (!automation) throw new NotFoundException('Automation not found');
    return automation;
  }

  async create(orgId: string, dto: any) {
    return this.prisma.automation.create({ data: { orgId, ...dto } });
  }

  async update(id: string, orgId: string, dto: any) {
    await this.findOne(id, orgId);
    return this.prisma.automation.update({ where: { id }, data: dto });
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    await this.prisma.automation.delete({ where: { id } });
    return { message: 'Automation deleted' };
  }

  async activate(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.automation.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async pause(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.automation.update({ where: { id }, data: { status: 'PAUSED' } });
  }

  async getRuns(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.automationRun.findMany({
      where: { automationId: id },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  async getStats(id: string, orgId: string) {
    await this.findOne(id, orgId);
    const [total, completed, failed, running] = await Promise.all([
      this.prisma.automationRun.count({ where: { automationId: id } }),
      this.prisma.automationRun.count({ where: { automationId: id, status: 'COMPLETED' } }),
      this.prisma.automationRun.count({ where: { automationId: id, status: 'FAILED' } }),
      this.prisma.automationRun.count({ where: { automationId: id, status: 'RUNNING' } }),
    ]);
    return { total, completed, failed, running };
  }
}
