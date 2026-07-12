import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Roles(Role.ADMIN)
  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Roles(Role.ADMIN)
  @Get('users-by-role')
  getUsersByRole() {
    return this.analyticsService.getUsersByRole();
  }

  @Roles(Role.ADMIN)
  @Get('courses-by-category')
  getCoursesByCategory() {
    return this.analyticsService.getCoursesByCategory();
  }

  @Roles(Role.ADMIN)
  @Get('courses-by-semester')
  getCoursesBySemester() {
    return this.analyticsService.getCoursesBySemester();
  }

  @Roles(Role.ADMIN)
  @Get('user-growth')
  getUserGrowth() {
    return this.analyticsService.getUserGrowth();
  }
}
