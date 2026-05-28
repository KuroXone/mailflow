import { PrismaService } from './prisma/prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
        };
    }>;
    root(): {
        name: string;
        version: string;
        docs: string;
    };
}
