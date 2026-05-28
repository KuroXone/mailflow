import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('automations')
@ApiBearerAuth()
@Controller('automations')
export class AutomationController {
  constructor(private svc: AutomationService) {}

  @Get() findAll(@OrgId() orgId: string) { return this.svc.findAll(orgId); }
  @Get(':id') findOne(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.findOne(id, orgId); }
  @Post() create(@OrgId() orgId: string, @Body() dto: any) { return this.svc.create(orgId, dto); }
  @Put(':id') update(@Param('id') id: string, @OrgId() orgId: string, @Body() dto: any) { return this.svc.update(id, orgId, dto); }
  @Delete(':id') delete(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.delete(id, orgId); }
  @Post(':id/activate') activate(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.activate(id, orgId); }
  @Post(':id/pause') pause(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.pause(id, orgId); }
  @Get(':id/runs') getRuns(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.getRuns(id, orgId); }
  @Get(':id/stats') getStats(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.getStats(id, orgId); }
}
