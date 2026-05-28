import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
export class TemplatesController {
  constructor(private svc: TemplatesService) {}

  @Get() findAll(@OrgId() orgId: string, @Query() query: any) { return this.svc.findAll(orgId, query); }
  @Get(':id') findOne(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.findOne(id, orgId); }
  @Post() create(@OrgId() orgId: string, @Body() dto: any) { return this.svc.create(orgId, dto); }
  @Put(':id') update(@Param('id') id: string, @OrgId() orgId: string, @Body() dto: any) { return this.svc.update(id, orgId, dto); }
  @Delete(':id') delete(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.delete(id, orgId); }
  @Post(':id/duplicate') duplicate(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.duplicate(id, orgId); }
}
