import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    user: {
      count: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
    course: {
      count: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      course: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  describe('getOverview', () => {
    it('returns counts for users, courses, and admins', async () => {
      prisma.user.count.mockResolvedValueOnce(50).mockResolvedValueOnce(3);
      prisma.course.count.mockResolvedValue(12);

      const result = await service.getOverview();

      expect(result).toEqual({
        users: 50,
        courses: 12,
        admins: 3,
      });
      expect(prisma.user.count).toHaveBeenCalledTimes(2);
      expect(prisma.user.count).toHaveBeenNthCalledWith(1);
      expect(prisma.user.count).toHaveBeenNthCalledWith(2, {
        where: { role: 'ADMIN' },
      });
    });
  });

  describe('getUsersByRole', () => {
    it('returns user counts grouped by role', async () => {
      prisma.user.groupBy.mockResolvedValue([
        { role: 'STUDENT', _count: { _all: 40 } },
        { role: 'MODERATOR', _count: { _all: 7 } },
        { role: 'ADMIN', _count: { _all: 3 } },
      ]);

      const result = await service.getUsersByRole();

      expect(prisma.user.groupBy).toHaveBeenCalledWith({
        by: ['role'],
        _count: { _all: true },
      });
      expect(result).toEqual([
        { role: 'STUDENT', count: 40 },
        { role: 'MODERATOR', count: 7 },
        { role: 'ADMIN', count: 3 },
      ]);
    });

    it('returns empty array when no users', async () => {
      prisma.user.groupBy.mockResolvedValue([]);

      const result = await service.getUsersByRole();

      expect(result).toEqual([]);
    });
  });

  describe('getCoursesByCategory', () => {
    it('returns course counts grouped by category', async () => {
      prisma.course.groupBy.mockResolvedValue([
        { category: 'Programming', _count: { _all: 3 } },
        { category: 'Mathematics', _count: { _all: 4 } },
      ]);

      const result = await service.getCoursesByCategory();

      expect(prisma.course.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        _count: { _all: true },
      });
      expect(result).toEqual([
        { category: 'Programming', count: 3 },
        { category: 'Mathematics', count: 4 },
      ]);
    });
  });

  describe('getCoursesBySemester', () => {
    it('returns courses by semester, filtered null, sorted ascending', async () => {
      prisma.course.groupBy.mockResolvedValue([
        { semester: 3, _count: { _all: 2 } },
        { semester: 1, _count: { _all: 5 } },
        { semester: null, _count: { _all: 1 } },
        { semester: 2, _count: { _all: 3 } },
      ]);

      const result = await service.getCoursesBySemester();

      expect(result).toEqual([
        { semester: 1, count: 5 },
        { semester: 2, count: 3 },
        { semester: 3, count: 2 },
      ]);
    });

    it('returns empty array when no courses with semester', async () => {
      prisma.course.groupBy.mockResolvedValue([
        { semester: null, _count: { _all: 1 } },
      ]);

      const result = await service.getCoursesBySemester();

      expect(result).toEqual([]);
    });
  });

  describe('getUserGrowth', () => {
    it('returns monthly cumulative user counts', async () => {
      prisma.user.findMany.mockResolvedValue([
        { createdAt: new Date('2024-01-15T00:00:00.000Z') },
        { createdAt: new Date('2024-01-20T00:00:00.000Z') },
        { createdAt: new Date('2024-02-10T00:00:00.000Z') },
        { createdAt: new Date('2024-03-05T00:00:00.000Z') },
        { createdAt: new Date('2024-03-15T00:00:00.000Z') },
      ]);

      const result = await service.getUserGrowth();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual([
        { month: '2024-01', count: 2, cumulative: 2 },
        { month: '2024-02', count: 1, cumulative: 3 },
        { month: '2024-03', count: 2, cumulative: 5 },
      ]);
    });

    it('returns empty array when no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getUserGrowth();

      expect(result).toEqual([]);
    });
  });
});
