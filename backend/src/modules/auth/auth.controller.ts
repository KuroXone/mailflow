import { Controller, Post, Body, Get, Query, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Create account' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto, req.headers['user-agent'], req.ip);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  verifyEmail(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  me(@CurrentUser() user: any) {
    const { passwordHash, verifyToken, resetToken, ...safe } = user;
    return safe;
  }
}
