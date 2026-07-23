import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { ProfessorsModule } from './professors/professors.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { CommunityModule } from './community/community.module';
import { ContactModule } from './contact/contact.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { validationSchema } from './config/env.config';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === 'production'
          ? {}
          : {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true },
              },
            },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const store = await redisStore({ url: redisUrl });
        return { store, ttl: 30_000 };
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 60 },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ProfessorsModule,
    AnalyticsModule,
    AnnouncementsModule,
    CommunityModule,
    ContactModule,
    EmailModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
