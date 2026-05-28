import { PrismaService } from '../../prisma/prisma.service';
import { CreateSmtpDto, UpdateSmtpDto } from './dto/smtp.dto';
export declare class SmtpService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        fromName: string;
        fromEmail: string;
        host: string;
        port: number;
        isActive: boolean;
        isDefault: boolean;
        dailyLimit: number;
        sentToday: number;
        totalSent: number;
        lastUsedAt: Date;
    }[]>;
    create(orgId: string, dto: CreateSmtpDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        fromName: string;
        fromEmail: string;
        host: string;
        port: number;
        secure: boolean;
        authUser: string;
        authPass: string;
        isActive: boolean;
        isDefault: boolean;
        dailyLimit: number;
        sentToday: number;
        totalSent: number;
        lastUsedAt: Date | null;
    }>;
    update(id: string, orgId: string, dto: UpdateSmtpDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        fromName: string;
        fromEmail: string;
        host: string;
        port: number;
        secure: boolean;
        authUser: string;
        authPass: string;
        isActive: boolean;
        isDefault: boolean;
        dailyLimit: number;
        sentToday: number;
        totalSent: number;
        lastUsedAt: Date | null;
    }>;
    test(id: string, orgId: string, toEmail: string): Promise<{
        success: boolean;
        message: any;
    }>;
    delete(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
