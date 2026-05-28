import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: any = {}) {
    const { category, search } = query;
    const where: any = {
      OR: [{ orgId }, { isGlobal: true }],
    };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    return this.prisma.emailTemplate.findMany({
      where, orderBy: [{ isGlobal: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, orgId: string) {
    const tmpl = await this.prisma.emailTemplate.findFirst({
      where: { id, OR: [{ orgId }, { isGlobal: true }] },
    });
    if (!tmpl) throw new NotFoundException('Template not found');
    return tmpl;
  }

  async create(orgId: string, dto: any) {
    return this.prisma.emailTemplate.create({ data: { orgId, ...dto } });
  }

  async update(id: string, orgId: string, dto: any) {
    await this.findOne(id, orgId);
    return this.prisma.emailTemplate.update({ where: { id }, data: dto });
  }

  async delete(id: string, orgId: string) {
    await this.prisma.emailTemplate.delete({ where: { id } });
    return { message: 'Template deleted' };
  }

  async duplicate(id: string, orgId: string) {
    const tmpl = await this.findOne(id, orgId);
    const { id: _id, isGlobal, createdAt, updatedAt, usageCount, ...rest } = tmpl as any;
    return this.prisma.emailTemplate.create({ data: { ...rest, orgId, name: `Copy of ${tmpl.name}`, isGlobal: false } });
  }
}
