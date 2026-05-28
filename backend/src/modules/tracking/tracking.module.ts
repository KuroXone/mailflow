import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { QueueModule } from '../queue/queue.module';

@Module({ imports: [QueueModule], controllers: [TrackingController] })
export class TrackingModule {}
