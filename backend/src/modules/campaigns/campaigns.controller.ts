import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, ScheduleCampaignDto } from './dto/campaign.dto';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private svc: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List campaigns' })
  findAll(@OrgId() orgId: string, @Query() query: any) {
    return this.svc.findAll(orgId, query);
  }

  @Get('stats')
  getStats(@OrgId() orgId: string) { return this.svc.getStats(orgId); }

  @Get(':id')
  findOne(@Param('id') id: string, @OrgId() orgId: string) {
    return this.svc.findOne(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create campaign' })
  create(@OrgId() orgId: string, @Body() dto: CreateCampaignDto) {
    return this.svc.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @OrgId() orgId: string, @Body() dto: UpdateCampaignDto) {
    return this.svc.update(id, orgId, dto);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @OrgId() orgId: string) {
    return this.svc.duplicate(id, orgId);
  }

  @Post(':id/schedule')
  schedule(@Param('id') id: string, @OrgId() orgId: string, @Body() dto: ScheduleCampaignDto) {
    return this.svc.schedule(id, orgId, dto);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @OrgId() orgId: string) {
    return this.svc.send(id, orgId);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string, @OrgId() orgId: string) {
    return this.svc.pause(id, orgId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @OrgId() orgId: string) {
    return this.svc.delete(id, orgId);
  }
}
