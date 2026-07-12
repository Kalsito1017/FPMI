import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { Public } from '../common/public.decorator';
import { toSafeUser } from '../common/safe-user.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@Req() req: Request & { user: User }) {
    return { user: toSafeUser(req.user) };
  }
}
