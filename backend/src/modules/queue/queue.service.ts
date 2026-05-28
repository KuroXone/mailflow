import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email-sending') private emailQueue: Queue,
    @InjectQueue('csv-import') private csvQueue: Queue,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  async enqueueCampaign(campaignId: string, orgId: string) {
    return this.emailQueue.add('send-campaign', { campaignId, orgId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async enqueueSingleEmail(data: {
    campaignId: string;
    contactId: string;
    orgId: string;
    emailLogId: string;
  }) {
    return this.emailQueue.add('send-single', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }

  async enqueueCsvImport(data: { orgId: string; listId: string; filePath: string }) {
    return this.csvQueue.add('import-csv', data, { attempts: 2 });
  }

  async trackEvent(data: {
    type: 'open' | 'click' | 'bounce' | 'complaint';
    trackingId: string;
    metadata?: Record<string, any>;
  }) {
    return this.analyticsQueue.add('track-event', data, {
      removeOnComplete: true,
      removeOnFail: 100,
    });
  }

  async getStats() {
    const [emailCounts, csvCounts] = await Promise.all([
      this.emailQueue.getJobCounts(),
      this.csvQueue.getJobCounts(),
    ]);
    return { emailQueue: emailCounts, csvQueue: csvCounts };
  }
}
