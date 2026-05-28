import { Queue } from 'bull';
export declare class QueueService {
    private emailQueue;
    private csvQueue;
    private analyticsQueue;
    constructor(emailQueue: Queue, csvQueue: Queue, analyticsQueue: Queue);
    enqueueCampaign(campaignId: string, orgId: string): Promise<import("bull").Job<any>>;
    enqueueSingleEmail(data: {
        campaignId: string;
        contactId: string;
        orgId: string;
        emailLogId: string;
    }): Promise<import("bull").Job<any>>;
    enqueueCsvImport(data: {
        orgId: string;
        listId: string;
        filePath: string;
    }): Promise<import("bull").Job<any>>;
    trackEvent(data: {
        type: 'open' | 'click' | 'bounce' | 'complaint';
        trackingId: string;
        metadata?: Record<string, any>;
    }): Promise<import("bull").Job<any>>;
    getStats(): Promise<{
        emailQueue: import("bull").JobCounts;
        csvQueue: import("bull").JobCounts;
    }>;
}
