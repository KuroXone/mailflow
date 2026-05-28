import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: { name?: string; timezone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, email: true, avatarUrl: true, timezone: true },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password updated. Please log in again.' };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect password');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted' };
  }
}
