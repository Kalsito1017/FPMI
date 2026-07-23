import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/roles.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('overview')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics overview' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('users-by-role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users grouped by role' })
  getUsersByRole() {
    return this.analyticsService.getUsersByRole();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('courses-by-category')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses grouped by category' })
  getCoursesByCategory() {
    return this.analyticsService.getCoursesByCategory();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('courses-by-semester')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses grouped by semester' })
  getCoursesBySemester() {
    return this.analyticsService.getCoursesBySemester();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('user-growth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user growth over time' })
  getUserGrowth() {
    return this.analyticsService.getUserGrowth();
  }
}
