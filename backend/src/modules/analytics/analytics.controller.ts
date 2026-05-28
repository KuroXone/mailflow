import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@OrgId() orgId: string) { return this.svc.getDashboard(orgId); }

  @Get('campaigns/:id')
  getCampaign(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.getCampaignAnalytics(id, orgId); }

  @Get('timeline')
  getTimeline(@OrgId() orgId: string, @Query('days') days: number) { return this.svc.getTimeline(orgId, days); }
}
