import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('domains')
@ApiBearerAuth()
@Controller('domains')
export class DomainsController {
  constructor(private svc: DomainsService) {}

  @Get()
  findAll(@OrgId() orgId: string) { return this.svc.findAll(orgId); }

  @Post()
  create(@OrgId() orgId: string, @Body() body: { domain: string; selector?: string }) {
    return this.svc.create(orgId, body.domain, body.selector);
  }

  @Get(':id/records')
  getRecords(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.getRecords(id, orgId); }

  @Post(':id/verify')
  verify(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.verify(id, orgId); }

  @Delete(':id')
  delete(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.delete(id, orgId); }
}
