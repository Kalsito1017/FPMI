import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { toSafeUser } from '../common/safe-user.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async verifyTurnstile(token?: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true;
    if (!token) return false;

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: formData },
    );
    const body = (await res.json()) as { success: boolean };
    return body.success;
  }

  private async generateAccessToken(userId: number): Promise<string> {
    return this.jwtService.signAsync({ sub: userId });
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const rawToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { token: this.hashToken(rawToken), userId, expiresAt },
    });
    return rawToken;
  }

  async register(dto: RegisterDto) {
    const valid = await this.verifyTurnstile(dto.turnstileToken);
    if (!valid) {
      throw new BadRequestException('CAPTCHA verification failed');
    }

    const role = (dto.role as Role) ?? Role.GUEST;
    if (role === 'STUDENT' && !dto.specialty) {
      throw new BadRequestException('Specialty is required for students');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          role,
          specialty: dto.specialty ?? null,
          hobbies: dto.hobbies ?? null,
        },
      });
      const accessToken = await this.generateAccessToken(user.id);
      const refreshToken = await this.generateRefreshToken(user.id);
      return { user: toSafeUser(user), accessToken, refreshToken };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);
    return { user: toSafeUser(user), accessToken, refreshToken };
  }

  async refreshAccessToken(refreshTokenStr: string) {
    const tokenHash = this.hashToken(refreshTokenStr);
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: { token: tokenHash, expiresAt: { gt: new Date() } },
    });
    if (deleted.count === 0) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const accessToken = await this.generateAccessToken(record.userId);
    const refreshToken = await this.generateRefreshToken(record.userId);
    return { accessToken, refreshToken };
  }

  async revokeRefreshToken(refreshTokenStr: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: this.hashToken(refreshTokenStr) },
    });
  }

  async revokeAllUserRefreshTokens(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await this.prisma.passwordResetToken.create({
        data: { email, token: this.hashToken(rawToken), expiresAt },
      });
      await this.emailService.sendPasswordResetEmail(email, rawToken);
    }

    return {
      message: 'If that email is registered, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.passwordResetToken.updateMany({
        where: { token: tokenHash, used: false, expiresAt: { gt: new Date() } },
        data: { used: true },
      });
      if (updated.count === 0) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      const record = await tx.passwordResetToken.findUnique({
        where: { token: tokenHash },
      });
      if (!record) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      const user = await tx.user.findUnique({
        where: { email: record.email },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const passwordHash = await bcrypt.hash(dto.password, 10);
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      return { message: 'Password reset successfully' };
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.specialty !== undefined && { specialty: dto.specialty }),
        ...(dto.hobbies !== undefined && { hobbies: dto.hobbies }),
      },
    });
    return { user: toSafeUser(user) };
  }

  async exportData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        communityPosts: true,
        communityComments: true,
        communityLikes: true,
        contactMessages: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...safe } = user;
    void passwordHash;
    return { user: safe };
  }

  async deleteAccount(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
      this.prisma.communityLike.deleteMany({ where: { userId } }),
      this.prisma.contactMessage.updateMany({
        where: { userId },
        data: { userId: null },
      }),
      this.prisma.communityComment.updateMany({
        where: { authorId: userId },
        data: { content: '[deleted]' },
      }),
      this.prisma.communityPost.updateMany({
        where: { authorId: userId },
        data: { content: '[deleted]', title: '[deleted]' },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          name: 'Deleted User',
          email: `deleted+${userId}@fpmi.bg`,
          passwordHash: crypto.randomBytes(32).toString('hex'),
          specialty: null,
          hobbies: null,
          avatar: null,
        },
      }),
    ]);
    return { message: 'Account deleted' };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    });
  }
}
