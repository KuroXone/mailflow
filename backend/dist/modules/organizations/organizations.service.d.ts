import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../queue/mail.service';
export declare class OrganizationsService {
    private prisma;
    private mail;
    constructor(prisma: PrismaService, mail: MailService);
    findOne(orgId: string): Promise<{
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
    updateMemberRole(orgId: string, memberId: string, role: string, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        userId: string;
        role: import(".prisma/client").$Enums.OrgRole;
        invitedBy: string | null;
        joinedAt: Date;
    }>;
    removeMember(orgId: string, memberId: string, actorId: string): Promise<{
        message: string;
    }>;
    inviteMember(orgId: string, email: string, role: string, actorId: string): Promise<{
        message: string;
        id: string;
    }>;
    acceptInvitation(token: string, userId: string): Promise<{
        orgId: string;
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
    cancelInvitation(orgId: string, invitationId: string): Promise<{
        message: string;
    }>;
    getApiKeys(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        keyPrefix: string;
        permissions: string[];
        lastUsedAt: Date;
    }[]>;
    createApiKey(orgId: string, userId: string, name: string, permissions: string[]): Promise<{
        key: string;
        keyPrefix: string;
    }>;
    deleteApiKey(orgId: string, keyId: string): Promise<{
        message: string;
    }>;
}
