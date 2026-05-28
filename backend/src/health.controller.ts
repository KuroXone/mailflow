import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('health')
  async health() {
    let db = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {}

    return {
      status: db ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: { database: db ? 'up' : 'down' },
    };
  }

  @Public()
  @Get()
  root() {
    return { name: 'MailFlow API', version: '1.0.0', docs: '/docs' };
  }
}
