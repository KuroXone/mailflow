import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        timezone: string;
        emailVerified: boolean;
        createdAt: Date;
        memberships: ({
            org: {
                id: string;
                name: string;
                slug: string;
                plan: import(".prisma/client").$Enums.PlanTier;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.OrgRole;
            createdAt: Date;
            orgId: string;
            userId: string;
            invitedBy: string | null;
            joinedAt: Date;
        })[];
    }>;
    updateProfile(userId: string, dto: {
        name?: string;
        timezone?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        timezone: string;
    }>;
    updateAvatar(userId: string, avatarUrl: string): Promise<{
        id: string;
        avatarUrl: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string, password: string): Promise<{
        message: string;
    }>;
}
