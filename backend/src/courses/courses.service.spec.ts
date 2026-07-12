import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: {
    course: {
      findMany: jest.Mock;
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
    it('returns all courses when no category filter', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findAll();

      expect(prisma.course.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([mockCourse]);
    });

    it('filters by category when provided', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findAll('Programming');

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { category: 'Programming' },
      });
      expect(result).toEqual([mockCourse]);
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
