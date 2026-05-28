import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
        orgId?: string;
    }): Promise<{
        currentOrgId: string;
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        avatarUrl: string | null;
        timezone: string | null;
        emailVerified: boolean;
        verifyToken: string | null;
        verifyTokenExp: Date | null;
        resetToken: string | null;
        resetTokenExp: Date | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
