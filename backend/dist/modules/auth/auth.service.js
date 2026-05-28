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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../queue/mail.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, mail) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.mail = mail;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const verifyToken = (0, uuid_1.v4)();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                name: dto.name,
                verifyToken,
                verifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        const orgName = dto.orgName || `${dto.name}'s Workspace`;
        const slug = await this.generateSlug(orgName);
        const org = await this.prisma.organization.create({
            data: {
                name: orgName,
                slug,
                members: { create: { userId: user.id, role: 'OWNER' } },
            },
        });
        await this.mail.sendVerification(user.email, user.name, verifyToken);
        const tokens = await this.generateTokens(user.id, user.email, org.id);
        return { ...tokens, user: this.sanitize(user), org };
    }
    async login(dto, userAgent, ip) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const membership = await this.prisma.orgMember.findFirst({
            where: { userId: user.id },
            include: { org: true },
            orderBy: { joinedAt: 'asc' },
        });
        const tokens = await this.generateTokens(user.id, user.email, membership?.orgId);
        await this.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                userAgent,
                ipAddress: ip,
            },
        });
        return { ...tokens, user: this.sanitize(user), org: membership?.org };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: { verifyToken: token, verifyTokenExp: { gt: new Date() } },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired token');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
        });
        return { message: 'Email verified successfully' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (!user)
            return { message: 'If that email exists, a reset link has been sent.' };
        const resetToken = (0, uuid_1.v4)();
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExp: new Date(Date.now() + 60 * 60 * 1000) },
        });
        await this.mail.sendPasswordReset(user.email, user.name, resetToken);
        return { message: 'If that email exists, a reset link has been sent.' };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: { resetToken: dto.token, resetTokenExp: { gt: new Date() } },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, resetToken: null, resetTokenExp: null },
        });
        await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        return { message: 'Password reset successfully' };
    }
    async refreshTokens(oldRefreshToken) {
        const stored = await this.prisma.refreshToken.findUnique({ where: { token: oldRefreshToken } });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token invalid or expired');
        }
        const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
        const membership = await this.prisma.orgMember.findFirst({
            where: { userId: user.id }, orderBy: { joinedAt: 'asc' },
        });
        const tokens = await this.generateTokens(user.id, user.email, membership?.orgId);
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { token: tokens.refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        });
        return tokens;
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        return { message: 'Logged out' };
    }
    async generateTokens(userId, email, orgId) {
        const payload = { sub: userId, email, orgId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('jwt.secret'),
                expiresIn: this.config.get('jwt.expiresIn'),
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('jwt.refreshSecret'),
                expiresIn: this.config.get('jwt.refreshExpiresIn'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    sanitize(user) {
        const { passwordHash, verifyToken, resetToken, ...safe } = user;
        return safe;
    }
    async generateSlug(name) {
        let slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50);
        let counter = 0;
        while (await this.prisma.organization.findUnique({ where: { slug } })) {
            slug = `${slug}-${++counter}`;
        }
        return slug;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map