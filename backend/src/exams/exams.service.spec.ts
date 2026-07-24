import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: {
    course: { findUnique: jest.Mock };
    exam: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockCourse = { id: 1, slug: 'informatika-1', title: 'Информатика I' };

  const mockExam = {
    id: 1,
    courseId: 1,
    title: 'Изпит — януари 2025',
    year: 2025,
    semester: 1,
    pdfUrl: 'https://example.com/exams/izpit-2025.pdf',
    createdById: 7,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      course: { findUnique: jest.fn().mockResolvedValue(mockCourse) },
      exam: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ExamsService);
  });

  describe('findAllByCourse', () => {
    it('returns exams ordered by year desc', async () => {
      prisma.exam.findMany.mockResolvedValue([mockExam]);

      const result = await service.findAllByCourse('informatika-1');

      expect(prisma.exam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 1 },
          orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        }),
      );
      expect(result).toEqual([mockExam]);
    });

    it('throws NotFoundException for unknown course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findAllByCourse('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates an exam', async () => {
      prisma.exam.create.mockResolvedValue(mockExam);

      const result = await service.create(
        'informatika-1',
        {
          title: 'Изпит — януари 2025',
          year: 2025,
          semester: 1,
          pdfUrl: 'https://example.com/exams/izpit-2025.pdf',
        },
        7,
      );

      expect(prisma.exam.create).toHaveBeenCalledWith({
        data: {
          courseId: 1,
          title: 'Изпит — януари 2025',
          year: 2025,
          semester: 1,
          pdfUrl: 'https://example.com/exams/izpit-2025.pdf',
          createdById: 7,
        },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      });
      expect(result).toEqual(mockExam);
    });

    it('defaults semester to null when not provided', async () => {
      prisma.exam.create.mockResolvedValue({ ...mockExam, semester: null });

      await service.create(
        'informatika-1',
        {
          title: 'Изпит',
          year: 2025,
          pdfUrl: 'https://example.com/exams/x.pdf',
        },
        7,
      );

      expect(prisma.exam.create).toHaveBeenCalledWith({
        data: {
          courseId: 1,
          title: 'Изпит',
          year: 2025,
          semester: null,
          pdfUrl: 'https://example.com/exams/x.pdf',
          createdById: 7,
        },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      });
    });
  });

  describe('update', () => {
    it('updates when author', async () => {
      prisma.exam.findUnique.mockResolvedValue(mockExam);
      prisma.exam.update.mockResolvedValue({ ...mockExam, year: 2024 });

      const result = await service.update(1, { year: 2024 }, 7, Role.STUDENT);

      expect(prisma.exam.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { year: 2024 },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      });
      expect(result.year).toBe(2024);
    });

    it('throws ForbiddenException for non-author student', async () => {
      prisma.exam.findUnique.mockResolvedValue(mockExam);

      await expect(
        service.update(1, { year: 2024 }, 999, Role.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows moderator to update others exams', async () => {
      prisma.exam.findUnique.mockResolvedValue(mockExam);
      prisma.exam.update.mockResolvedValue(mockExam);

      await service.update(1, { year: 2024 }, 999, Role.MODERATOR);

      expect(prisma.exam.update).toHaveBeenCalled();
    });

    it('throws NotFoundException when missing', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { year: 2024 }, 7, Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes when author', async () => {
      prisma.exam.findUnique.mockResolvedValue(mockExam);
      prisma.exam.delete.mockResolvedValue(mockExam);

      await service.remove(1, 7, Role.STUDENT);

      expect(prisma.exam.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws ForbiddenException for non-author student', async () => {
      prisma.exam.findUnique.mockResolvedValue(mockExam);

      await expect(service.remove(1, 999, Role.STUDENT)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when missing', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 7, Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
