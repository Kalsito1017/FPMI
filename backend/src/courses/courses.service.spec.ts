import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: {
    course: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockCourse = {
    id: 1,
    title: 'Увод в програмирането',
    slug: 'uvod-v-programiraneto',
    description: 'Основи.',
    semester: 1,
    credits: 6,
    category: 'Programming',
  };

  beforeEach(async () => {
    prisma = {
      course: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CoursesService);
  });

  describe('findAll', () => {
    it('returns paginated courses when no category filter', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: undefined,
        orderBy: { id: 'asc' },
      });
      expect(prisma.course.count).toHaveBeenCalledWith({ where: undefined });
      expect(result).toEqual({
        data: [mockCourse],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
    });

    it('filters by category when provided', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({ category: 'Programming' });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { category: 'Programming' },
        orderBy: { id: 'asc' },
      });
      expect(prisma.course.count).toHaveBeenCalledWith({
        where: { category: 'Programming' },
      });
      expect(result.meta.total).toBe(1);
    });

    it('applies skip and take for page 2', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      prisma.course.count.mockResolvedValue(30);

      const result = await service.findAll({ page: 2, limit: 20 });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 20,
        where: undefined,
        orderBy: { id: 'asc' },
      });
      expect(result.meta).toEqual({
        total: 30,
        page: 2,
        limit: 20,
        totalPages: 2,
      });
    });
  });

  describe('findOne', () => {
    it('returns course by slug', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findOne('uvod-v-programiraneto');

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { slug: 'uvod-v-programiraneto' },
      });
      expect(result).toEqual(mockCourse);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
