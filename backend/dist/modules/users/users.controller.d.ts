import { UsersService } from './users.service';
export declare class UsersController {
    private svc;
    constructor(svc: UsersService);
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, dto: {
        name?: string;
        timezone?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        timezone: string;
    }>;
    updateAvatar(user: any, body: {
        avatarUrl: string;
    }): Promise<{
        id: string;
        avatarUrl: string;
    }>;
    changePassword(user: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    deleteAccount(user: any, body: {
        password: string;
    }): Promise<{
        message: string;
    }>;
}
