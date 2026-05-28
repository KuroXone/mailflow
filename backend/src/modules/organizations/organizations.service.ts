import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../queue/mail.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  async findOne(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { members: true, contacts: true, campaigns: true } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(orgId: string, dto: any) {
    return this.prisma.organization.update({ where: { id: orgId }, data: dto });
  }

  async getMembers(orgId: string) {
    return this.prisma.orgMember.findMany({
      where: { orgId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMemberRole(orgId: string, memberId: string, role: string, actorId: string) {
    const actor = await this.prisma.orgMember.findFirst({ where: { orgId, userId: actorId } });
    if (actor?.role !== 'OWNER' && actor?.role !== 'ADMIN') throw new ForbiddenException('Insufficient permissions');

    return this.prisma.orgMember.update({ where: { id: memberId }, data: { role: role as any } });
  }

  async removeMember(orgId: string, memberId: string, actorId: string) {
    const actor = await this.prisma.orgMember.findFirst({ where: { orgId, userId: actorId } });
    if (actor?.role !== 'OWNER' && actor?.role !== 'ADMIN') throw new ForbiddenException('Insufficient permissions');

    const member = await this.prisma.orgMember.findUnique({ where: { id: memberId } });
    if (member?.userId === actorId) throw new ForbiddenException('Cannot remove yourself');

    await this.prisma.orgMember.delete({ where: { id: memberId } });
    return { message: 'Member removed' };
  }

  async inviteMember(orgId: string, email: string, role: string, actorId: string) {
    const actor = await this.prisma.orgMember.findFirst({ where: { orgId, userId: actorId } });
    if (actor?.role !== 'OWNER' && actor?.role !== 'ADMIN') throw new ForbiddenException('Insufficient permissions');

    const existing = await this.prisma.invitation.findFirst({ where: { orgId, email, acceptedAt: null } });
    if (existing) throw new ConflictException('Invitation already sent');

    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.create({
      data: { orgId, email, role: role as any, token, expiresAt, invitedById: actorId },
    });

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    const actorUser = await this.prisma.user.findUnique({ where: { id: actorId }, select: { name: true } });
    await this.mail.sendTeamInvite(email, actorUser?.name || 'A team member', org?.name || 'Your Team', token);

    return { message: 'Invitation sent', id: invitation.id };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { token, acceptedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!invitation) throw new NotFoundException('Invalid or expired invitation');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.email !== invitation.email) throw new ForbiddenException('Email mismatch');

    await this.prisma.$transaction([
      this.prisma.orgMember.create({
        data: { orgId: invitation.orgId, userId, role: invitation.role },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { orgId: invitation.orgId };
  }

  async getInvitations(orgId: string) {
    return this.prisma.invitation.findMany({
      where: { orgId, acceptedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelInvitation(orgId: string, invitationId: string) {
    await this.prisma.invitation.deleteMany({ where: { id: invitationId, orgId } });
    return { message: 'Invitation cancelled' };
  }

  async getApiKeys(orgId: string) {
    return this.prisma.apiKey.findMany({
      where: { orgId },
      select: { id: true, name: true, keyPrefix: true, permissions: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createApiKey(orgId: string, userId: string, name: string, permissions: string[]) {
    const crypto = require('crypto');
    const fullKey = `mf_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = fullKey.substring(0, 12);
    const keyHash = require('crypto').createHash('sha256').update(fullKey).digest('hex');

    await this.prisma.apiKey.create({
      data: { orgId, userId, name, keyHash, keyPrefix, permissions },
    });

    return { key: fullKey, keyPrefix };
  }

  async deleteApiKey(orgId: string, keyId: string) {
    await this.prisma.apiKey.deleteMany({ where: { id: keyId, orgId } });
    return { message: 'API key deleted' };
  }
}
