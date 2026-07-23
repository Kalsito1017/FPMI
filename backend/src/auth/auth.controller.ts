import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { SafeUser } from '../common/safe-user.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.SECURE_COOKIES === 'true',
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  ...ACCESS_COOKIE_OPTIONS,
  path: '/auth/refresh',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user: result.user };
  }

  @Public()
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user: result.user };
  }
  @Public()
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const tokenStr = cookies?.refresh_token;
    if (!tokenStr) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const result = await this.authService.refreshAccessToken(tokenStr);
    res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { message: 'Token refreshed' };
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @Req() req: Request & { user?: SafeUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user?.id) {
      await this.authService.revokeAllUserRefreshTokens(req.user.id);
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { message: 'Logged out' };
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@Req() req: Request & { user: SafeUser }) {
    return { user: req.user };
  }

  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @Req() req: Request & { user: SafeUser },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  changePassword(
    @Req() req: Request & { user: SafeUser },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @ApiBearerAuth()
  @Get('export-data')
  @ApiOperation({ summary: 'Export user data' })
  exportData(@Req() req: Request & { user: SafeUser }) {
    return this.authService.exportData(req.user.id);
  }

  @ApiBearerAuth()
  @Delete('account')
  @ApiOperation({ summary: 'Delete account' })
  deleteAccount(@Req() req: Request & { user: SafeUser }) {
    return this.authService.deleteAccount(req.user.id);
  }
}
