import { Controller, Get, Put, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get('me') getProfile(@CurrentUser() user: any) { return this.svc.getProfile(user.id); }
  @Put('me') updateProfile(@CurrentUser() user: any, @Body() dto: { name?: string; timezone?: string }) {
    return this.svc.updateProfile(user.id, dto);
  }
  @Put('me/avatar') updateAvatar(@CurrentUser() user: any, @Body() body: { avatarUrl: string }) {
    return this.svc.updateAvatar(user.id, body.avatarUrl);
  }
  @Post('me/change-password') changePassword(@CurrentUser() user: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.svc.changePassword(user.id, body.currentPassword, body.newPassword);
  }
  @Delete('me') deleteAccount(@CurrentUser() user: any, @Body() body: { password: string }) {
    return this.svc.deleteAccount(user.id, body.password);
  }
}
