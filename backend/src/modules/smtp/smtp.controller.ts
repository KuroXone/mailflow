import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SmtpService } from './smtp.service';
import { CreateSmtpDto, UpdateSmtpDto } from './dto/smtp.dto';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('smtp')
@ApiBearerAuth()
@Controller('smtp')
export class SmtpController {
  constructor(private svc: SmtpService) {}

  @Get() findAll(@OrgId() orgId: string) { return this.svc.findAll(orgId); }
  @Post() create(@OrgId() orgId: string, @Body() dto: CreateSmtpDto) { return this.svc.create(orgId, dto); }
  @Put(':id') update(@Param('id') id: string, @OrgId() orgId: string, @Body() dto: UpdateSmtpDto) { return this.svc.update(id, orgId, dto); }
  @Post(':id/test') test(@Param('id') id: string, @OrgId() orgId: string, @Body('email') email: string) { return this.svc.test(id, orgId, email); }
  @Delete(':id') delete(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.delete(id, orgId); }
}
