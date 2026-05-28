import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/login.dto';
import { MailService } from '../queue/mail.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private mail;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, mail: MailService);
    register(dto: RegisterDto): Promise<{
        user: any;
        org: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            logo: string | null;
            website: string | null;
            plan: import(".prisma/client").$Enums.PlanTier;
            emailsSent: number;
            emailsLimit: number;
            contactsCount: number;
            contactsLimit: number;
            customDomain: string | null;
            whitelabel: boolean;
            stripeCustomerId: string | null;
            billingEmail: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto, userAgent?: string, ip?: string): Promise<{
        user: any;
        org: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            logo: string | null;
            website: string | null;
            plan: import(".prisma/client").$Enums.PlanTier;
            emailsSent: number;
            emailsLimit: number;
            contactsCount: number;
            contactsLimit: number;
            customDomain: string | null;
            whitelabel: boolean;
            stripeCustomerId: string | null;
            billingEmail: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshTokens(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private sanitize;
    private generateSlug;
}
