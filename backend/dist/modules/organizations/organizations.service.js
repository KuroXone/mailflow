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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../queue/mail.service");
let OrganizationsService = class OrganizationsService {
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async findOne(orgId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: { _count: { select: { members: true, contacts: true, campaigns: true } } },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async update(orgId, dto) {
        return this.prisma.organization.update({ where: { id: orgId }, data: dto });
    }
    async getMembers(orgId) {
        return this.prisma.orgMember.findMany({
            where: { orgId },
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async updateMemberRole(orgId, memberId, role, actorId) {
        const actor = await this.prisma.orgMember.findFirst({ where: { orgId, userId: actorId } });
        if (actor?.role !== 'OWNER' && actor?.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Insufficient permissions');
        return this.prisma.orgMember.update({ where: { id: memberId }, data: { role: role } });
    }
    async removeMember(orgId, memberId, actorId) {
        const actor = await this.prisma.orgMember.findFirst({ where: { orgId, userId: actorId } });
        if (actor?.role !== 'OWNER' && actor?.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Insufficient permissions');
        const member = await this.prisma.orgMember.findUnique({ where: { id: memberId } });
        if (member?.userId === actorId)
            throw new common_1.ForbiddenException('Cannot remove yourself');
        await this.prisma.orgMember.delete({ where: { id: memberId } });
        return { message: 'Member removed' };
    }
    async inviteMember(orgId, email, role, actorId) {
        const actor = await this.prisma.orgMember.findFirst({ where: { orgId, userId: actorId } });
        if (actor?.role !== 'OWNER' && actor?.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Insufficient permissions');
        const existing = await this.prisma.invitation.findFirst({ where: { orgId, email, acceptedAt: null } });
        if (existing)
            throw new common_1.ConflictException('Invitation already sent');
        const token = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const invitation = await this.prisma.invitation.create({
            data: { orgId, email, role: role, token, expiresAt, invitedById: actorId },
        });
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        const actorUser = await this.prisma.user.findUnique({ where: { id: actorId }, select: { name: true } });
        await this.mail.sendTeamInvite(email, actorUser?.name || 'A team member', org?.name || 'Your Team', token);
        return { message: 'Invitation sent', id: invitation.id };
    }
    async acceptInvitation(token, userId) {
        const invitation = await this.prisma.invitation.findFirst({
            where: { token, acceptedAt: null, expiresAt: { gt: new Date() } },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invalid or expired invitation');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user?.email !== invitation.email)
            throw new common_1.ForbiddenException('Email mismatch');
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
    async getInvitations(orgId) {
        return this.prisma.invitation.findMany({
            where: { orgId, acceptedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
    async cancelInvitation(orgId, invitationId) {
        await this.prisma.invitation.deleteMany({ where: { id: invitationId, orgId } });
        return { message: 'Invitation cancelled' };
    }
    async getApiKeys(orgId) {
        return this.prisma.apiKey.findMany({
            where: { orgId },
            select: { id: true, name: true, keyPrefix: true, permissions: true, lastUsedAt: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createApiKey(orgId, userId, name, permissions) {
        const crypto = require('crypto');
        const fullKey = `mf_${crypto.randomBytes(32).toString('hex')}`;
        const keyPrefix = fullKey.substring(0, 12);
        const keyHash = require('crypto').createHash('sha256').update(fullKey).digest('hex');
        await this.prisma.apiKey.create({
            data: { orgId, userId, name, keyHash, keyPrefix, permissions },
        });
        return { key: fullKey, keyPrefix };
    }
    async deleteApiKey(orgId, keyId) {
        await this.prisma.apiKey.deleteMany({ where: { id: keyId, orgId } });
        return { message: 'API key deleted' };
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, mail_service_1.MailService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map