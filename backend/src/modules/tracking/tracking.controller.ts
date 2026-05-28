import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private prisma: PrismaService, private queue: QueueService) {}

  @Public()
  @Get('open/:trackingId')
  async trackOpen(@Param('trackingId') trackingId: string, @Req() req: Request, @Res() res: Response) {
    await this.queue.trackEvent({
      type: 'open',
      trackingId,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });
    res.set({ 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache' });
    res.send(PIXEL);
  }

  @Public()
  @Get('click/:trackingId')
  async trackClick(@Param('trackingId') trackingId: string, @Query('url') url: string, @Req() req: Request, @Res() res: Response) {
    if (!url) return res.status(400).send('Missing url');

    await this.queue.trackEvent({
      type: 'click',
      trackingId,
      metadata: { url, userAgent: req.headers['user-agent'], ip: req.ip },
    });

    res.redirect(decodeURIComponent(url));
  }

  @Public()
  @Get('unsubscribe/:trackingId')
  async unsubscribe(@Param('trackingId') trackingId: string, @Res() res: Response) {
    const log = await this.prisma.emailLog.findUnique({ where: { trackingId } });
    if (log) {
      await this.prisma.contact.updateMany({
        where: { id: log.contactId },
        data: { status: 'UNSUBSCRIBED' },
      });
      await this.prisma.emailLog.update({
        where: { trackingId },
        data: { status: 'UNSUBSCRIBED' },
      });
      await this.prisma.campaignAnalytics.update({
        where: { campaignId: log.campaignId },
        data: { unsubscribed: { increment: 1 } },
      });
    }
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2>✓ You've been unsubscribed</h2>
      <p>You will no longer receive emails from this sender.</p>
    </body></html>`);
  }
}
