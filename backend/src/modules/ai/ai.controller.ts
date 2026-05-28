import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private svc: AiService) {}

  @Post('generate-email')
  generateEmail(@Body() body: { prompt: string; tone?: string }) {
    return this.svc.generateEmail(body.prompt, body.tone);
  }

  @Post('subject-lines')
  generateSubjectLines(@Body() body: { context: string; count?: number }) {
    return this.svc.generateSubjectLines(body.context, body.count);
  }

  @Post('analyze-campaign')
  analyzeCampaign(@Body() body: { subject: string; htmlContent: string; listSize?: number }) {
    return this.svc.analyzeCampaign(body);
  }

  @Post('optimize-subject')
  optimizeSubject(@Body() body: { subject: string }) {
    return this.svc.optimizeSubject(body.subject);
  }

  @Post('best-send-time')
  getBestSendTime(@Body() body: { industry: string; audienceTimezone?: string }) {
    return this.svc.getBestSendTime(body.industry, body.audienceTimezone);
  }
}
