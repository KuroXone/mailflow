import { Response, Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class TrackingController {
    private prisma;
    private queue;
    constructor(prisma: PrismaService, queue: QueueService);
    trackOpen(trackingId: string, req: Request, res: Response): Promise<void>;
    trackClick(trackingId: string, url: string, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    unsubscribe(trackingId: string, res: Response): Promise<void>;
}
