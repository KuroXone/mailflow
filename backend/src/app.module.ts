import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { DomainsModule } from './modules/domains/domains.module';
import { SmtpModule } from './modules/smtp/smtp.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { QueueModule } from './modules/queue/queue.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { AiModule } from './modules/ai/ai.module';
import { AutomationModule } from './modules/automation/automation.module';
import { BillingModule } from './modules/billing/billing.module';
import configuration from './config/configuration';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: config.get('redis.url') || 'redis://localhost:6379',
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CampaignsModule,
    ContactsModule,
    TemplatesModule,
    DomainsModule,
    SmtpModule,
    AnalyticsModule,
    QueueModule,
    TrackingModule,
    AiModule,
    AutomationModule,
    BillingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
