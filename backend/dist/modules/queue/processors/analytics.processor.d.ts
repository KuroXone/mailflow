import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class AnalyticsProcessor {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleTrackEvent(job: Job<{
        type: 'open' | 'click' | 'bounce' | 'complaint';
        trackingId: string;
        metadata?: Record<string, any>;
    }>): Promise<void>;
}
