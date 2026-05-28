import { PrismaService } from '../../prisma/prisma.service';
export declare class AutomationService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string): Promise<({
        _count: {
            runs: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.AutomationStatus;
        version: number;
        triggerType: import(".prisma/client").$Enums.TriggerType;
        triggerConfig: import("@prisma/client/runtime/library").JsonValue | null;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        enrolledCount: number;
        completedCount: number;
    })[]>;
    findOne(id: string, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.AutomationStatus;
        version: number;
        triggerType: import(".prisma/client").$Enums.TriggerType;
        triggerConfig: import("@prisma/client/runtime/library").JsonValue | null;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        enrolledCount: number;
        completedCount: number;
    }>;
    create(orgId: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.AutomationStatus;
        version: number;
        triggerType: import(".prisma/client").$Enums.TriggerType;
        triggerConfig: import("@prisma/client/runtime/library").JsonValue | null;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        enrolledCount: number;
        completedCount: number;
    }>;
    update(id: string, orgId: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.AutomationStatus;
        version: number;
        triggerType: import(".prisma/client").$Enums.TriggerType;
        triggerConfig: import("@prisma/client/runtime/library").JsonValue | null;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        enrolledCount: number;
        completedCount: number;
    }>;
    delete(id: string, orgId: string): Promise<{
        message: string;
    }>;
    activate(id: string, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.AutomationStatus;
        version: number;
        triggerType: import(".prisma/client").$Enums.TriggerType;
        triggerConfig: import("@prisma/client/runtime/library").JsonValue | null;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        enrolledCount: number;
        completedCount: number;
    }>;
    pause(id: string, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.AutomationStatus;
        version: number;
        triggerType: import(".prisma/client").$Enums.TriggerType;
        triggerConfig: import("@prisma/client/runtime/library").JsonValue | null;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        enrolledCount: number;
        completedCount: number;
    }>;
    getRuns(id: string, orgId: string): Promise<{
        id: string;
        status: string;
        completedAt: Date | null;
        contactId: string;
        automationId: string;
        currentNodeId: string | null;
        startedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getStats(id: string, orgId: string): Promise<{
        total: number;
        completed: number;
        failed: number;
        running: number;
    }>;
}
