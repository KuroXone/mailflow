import { PrismaService } from '../../prisma/prisma.service';
export declare class TemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string, query?: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string | null;
        subject: string | null;
        htmlContent: string;
        jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
        isDefault: boolean;
        category: string | null;
        isGlobal: boolean;
        thumbnail: string | null;
        usageCount: number;
    }[]>;
    findOne(id: string, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string | null;
        subject: string | null;
        htmlContent: string;
        jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
        isDefault: boolean;
        category: string | null;
        isGlobal: boolean;
        thumbnail: string | null;
        usageCount: number;
    }>;
    create(orgId: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string | null;
        subject: string | null;
        htmlContent: string;
        jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
        isDefault: boolean;
        category: string | null;
        isGlobal: boolean;
        thumbnail: string | null;
        usageCount: number;
    }>;
    update(id: string, orgId: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string | null;
        subject: string | null;
        htmlContent: string;
        jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
        isDefault: boolean;
        category: string | null;
        isGlobal: boolean;
        thumbnail: string | null;
        usageCount: number;
    }>;
    delete(id: string, orgId: string): Promise<{
        message: string;
    }>;
    duplicate(id: string, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string | null;
        subject: string | null;
        htmlContent: string;
        jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
        isDefault: boolean;
        category: string | null;
        isGlobal: boolean;
        thumbnail: string | null;
        usageCount: number;
    }>;
}
