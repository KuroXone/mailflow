import {
  Injectable, BadRequestException, UnauthorizedException,
  ConflictException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/login.dto';
import { MailService } from '../queue/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verifyToken = uuid();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        verifyToken,
        verifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Create default org
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

  // ── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, userAgent?: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    // Get first org
    const membership = await this.prisma.orgMember.findFirst({
      where: { userId: user.id },
      include: { org: true },
      orderBy: { joinedAt: 'asc' },
    });

    const tokens = await this.generateTokens(user.id, user.email, membership?.orgId);

    // Store refresh token
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

  // ── Verify Email ─────────────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verifyToken: token, verifyTokenExp: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
    });

    return { message: 'Email verified successfully' };
  }

  // ── Forgot / Reset Password ──────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const resetToken = uuid();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp: new Date(Date.now() + 60 * 60 * 1000) },
    });

    await this.mail.sendPasswordReset(user.email, user.name, resetToken);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: dto.token, resetTokenExp: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    return { message: 'Password reset successfully' };
  }

  // ── Refresh Token ────────────────────────────────────────────────────────────

  async refreshTokens(oldRefreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token: oldRefreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
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

  // ── Logout ───────────────────────────────────────────────────────────────────

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { message: 'Logged out' };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, orgId?: string) {
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

  private sanitize(user: any) {
    const { passwordHash, verifyToken, resetToken, ...safe } = user;
    return safe;
  }

  private async generateSlug(name: string): Promise<string> {
    let slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50);
    let counter = 0;
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${slug}-${++counter}`;
    }
    return slug;
  }
}
