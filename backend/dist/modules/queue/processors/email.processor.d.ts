import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class EmailProcessor {
    private prisma;
    private config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    handleCampaign(job: Job<{
        campaignId: string;
        orgId: string;
    }>): Promise<void>;
    private personalize;
}
