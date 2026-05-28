import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private svc;
    constructor(svc: OrganizationsService);
    getCurrent(orgId: string): Promise<{
        _count: {
            members: number;
            campaigns: number;
            contacts: number;
        };
    } & {
        id: string;
        slug: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(orgId: string, dto: any): Promise<{
        id: string;
        slug: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMembers(orgId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        userId: string;
        role: import(".prisma/client").$Enums.OrgRole;
        invitedBy: string | null;
        joinedAt: Date;
    })[]>;
    updateRole(orgId: string, id: string, body: {
        role: string;
    }, user: any): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        userId: string;
        role: import(".prisma/client").$Enums.OrgRole;
        invitedBy: string | null;
        joinedAt: Date;
    }>;
    removeMember(orgId: string, id: string, user: any): Promise<{
        message: string;
    }>;
    getInvitations(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        role: import(".prisma/client").$Enums.OrgRole;
        email: string;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
        invitedById: string | null;
    }[]>;
    invite(orgId: string, user: any, body: {
        email: string;
        role: string;
    }): Promise<{
        message: string;
        id: string;
    }>;
    cancelInvite(orgId: string, id: string): Promise<{
        message: string;
    }>;
    acceptInvite(body: {
        token: string;
    }, user: any): Promise<{
        orgId: string;
    }>;
    getApiKeys(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        keyPrefix: string;
        permissions: string[];
        lastUsedAt: Date;
    }[]>;
    createApiKey(orgId: string, user: any, body: {
        name: string;
        permissions: string[];
    }): Promise<{
        key: string;
        keyPrefix: string;
    }>;
    deleteApiKey(orgId: string, id: string): Promise<{
        message: string;
    }>;
}
