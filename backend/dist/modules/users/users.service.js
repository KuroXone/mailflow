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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, email: true, avatarUrl: true, timezone: true,
                emailVerified: true, createdAt: true,
                memberships: {
                    include: { org: { select: { id: true, name: true, slug: true, plan: true } } },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(userId, dto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: { id: true, name: true, email: true, avatarUrl: true, timezone: true },
        });
    }
    async updateAvatar(userId, avatarUrl) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { id: true, avatarUrl: true },
        });
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const hash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        return { message: 'Password updated. Please log in again.' };
    }
    async deleteAccount(userId, password) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException();
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Incorrect password');
        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Account deleted' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map