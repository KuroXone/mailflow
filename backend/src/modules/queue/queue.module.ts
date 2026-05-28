import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailService } from './mail.service';
import { QueueService } from './queue.service';
import { EmailProcessor } from './processors/email.processor';
import { CsvProcessor } from './processors/csv.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email-sending' },
      { name: 'csv-import' },
      { name: 'analytics' },
    ),
  ],
  providers: [MailService, QueueService, EmailProcessor, CsvProcessor, AnalyticsProcessor],
  exports: [MailService, QueueService, BullModule],
})
export class QueueModule {}
