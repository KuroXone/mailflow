import { Controller, Get, Put, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { OrgId } from '../../common/decorators/org.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private svc: OrganizationsService) {}

  @Get('current') getCurrent(@OrgId() orgId: string) { return this.svc.findOne(orgId); }
  @Put('current') update(@OrgId() orgId: string, @Body() dto: any) { return this.svc.update(orgId, dto); }

  @Get('members') getMembers(@OrgId() orgId: string) { return this.svc.getMembers(orgId); }
  @Put('members/:id/role') updateRole(@OrgId() orgId: string, @Param('id') id: string, @Body() body: { role: string }, @CurrentUser() user: any) {
    return this.svc.updateMemberRole(orgId, id, body.role, user.id);
  }
  @Delete('members/:id') removeMember(@OrgId() orgId: string, @Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.removeMember(orgId, id, user.id);
  }

  @Get('invitations') getInvitations(@OrgId() orgId: string) { return this.svc.getInvitations(orgId); }
  @Post('invite') invite(@OrgId() orgId: string, @CurrentUser() user: any, @Body() body: { email: string; role: string }) {
    return this.svc.inviteMember(orgId, body.email, body.role, user.id);
  }
  @Delete('invitations/:id') cancelInvite(@OrgId() orgId: string, @Param('id') id: string) {
    return this.svc.cancelInvitation(orgId, id);
  }

  @Public()
  @Post('accept-invite')
  acceptInvite(@Body() body: { token: string }, @CurrentUser() user: any) {
    return this.svc.acceptInvitation(body.token, user?.id);
  }

  @Get('api-keys') getApiKeys(@OrgId() orgId: string) { return this.svc.getApiKeys(orgId); }
  @Post('api-keys') createApiKey(@OrgId() orgId: string, @CurrentUser() user: any, @Body() body: { name: string; permissions: string[] }) {
    return this.svc.createApiKey(orgId, user.id, body.name, body.permissions);
  }
  @Delete('api-keys/:id') deleteApiKey(@OrgId() orgId: string, @Param('id') id: string) {
    return this.svc.deleteApiKey(orgId, id);
  }
}
