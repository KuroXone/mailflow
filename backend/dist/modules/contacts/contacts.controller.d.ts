import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, CreateListDto } from './dto/contact.dto';
export declare class ContactsController {
    private svc;
    constructor(svc: ContactsService);
    getLists(orgId: string): Promise<({
        _count: {
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        isDefault: boolean;
        count: number;
    })[]>;
    createList(orgId: string, dto: CreateListDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        isDefault: boolean;
        count: number;
    }>;
    deleteList(id: string, orgId: string): Promise<{
        message: string;
    }>;
    getStats(orgId: string): Promise<{
        total: number;
        subscribed: number;
        unsubscribed: number;
        bounced: number;
    }>;
    getTags(orgId: string): Promise<string[]>;
    findAll(orgId: string, query: any): Promise<{
        items: ({
            listMemberships: ({
                list: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                listId: string;
                contactId: string;
                subscribedAt: Date;
            })[];
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            tags: string[];
            status: import(".prisma/client").$Enums.ContactStatus;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            source: string | null;
            customFields: import("@prisma/client/runtime/library").JsonValue | null;
            score: number;
            lastActivity: Date | null;
        })[];
        total: number;
        page: any;
        limit: any;
        pages: number;
    }>;
    findOne(id: string, orgId: string): Promise<{
        emailLogs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            userAgent: string | null;
            ipAddress: string | null;
            campaignId: string;
            status: import(".prisma/client").$Enums.EmailLogStatus;
            sentAt: Date | null;
            smtpConfigId: string | null;
            contactId: string;
            trackingId: string;
            openedAt: Date | null;
            clickedAt: Date | null;
            bouncedAt: Date | null;
            bounceType: string | null;
            bounceReason: string | null;
            country: string | null;
            city: string | null;
            device: string | null;
            opens: number;
            clicks: number;
        }[];
        listMemberships: ({
            list: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                orgId: string;
                description: string | null;
                isDefault: boolean;
                count: number;
            };
        } & {
            id: string;
            listId: string;
            contactId: string;
            subscribedAt: Date;
        })[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        tags: string[];
        status: import(".prisma/client").$Enums.ContactStatus;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        source: string | null;
        customFields: import("@prisma/client/runtime/library").JsonValue | null;
        score: number;
        lastActivity: Date | null;
    }>;
    create(orgId: string, dto: CreateContactDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        tags: string[];
        status: import(".prisma/client").$Enums.ContactStatus;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        source: string | null;
        customFields: import("@prisma/client/runtime/library").JsonValue | null;
        score: number;
        lastActivity: Date | null;
    }>;
    update(id: string, orgId: string, dto: UpdateContactDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        tags: string[];
        status: import(".prisma/client").$Enums.ContactStatus;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        source: string | null;
        customFields: import("@prisma/client/runtime/library").JsonValue | null;
        score: number;
        lastActivity: Date | null;
    }>;
    delete(id: string, orgId: string): Promise<{
        message: string;
    }>;
    addTag(id: string, orgId: string, tag: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        tags: string[];
        status: import(".prisma/client").$Enums.ContactStatus;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        source: string | null;
        customFields: import("@prisma/client/runtime/library").JsonValue | null;
        score: number;
        lastActivity: Date | null;
    }>;
    removeTag(id: string, orgId: string, tag: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        tags: string[];
        status: import(".prisma/client").$Enums.ContactStatus;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        source: string | null;
        customFields: import("@prisma/client/runtime/library").JsonValue | null;
        score: number;
        lastActivity: Date | null;
    }>;
    import(orgId: string, listId: string, file: Express.Multer.File): Promise<import("bull").Job<any>>;
    addToList(listId: string, contactId: string, orgId: string): Promise<{
        message: string;
    }>;
    removeFromList(listId: string, contactId: string): Promise<{
        message: string;
    }>;
}
