import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { WikiService } from './wiki.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WikiService', () => {
  let service: WikiService;
  let prisma: {
    course: { findUnique: jest.Mock };
    wikiPage: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockCourse = { id: 1, slug: 'informatika-1', title: 'Информатика I' };

  const mockPage = {
    id: 1,
    courseId: 1,
    slug: 'uvod-v-programiraneto',
    title: 'Увод в програмирането',
    content: '# Увод',
    status: 'PUBLISHED',
    createdById: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      course: { findUnique: jest.fn().mockResolvedValue(mockCourse) },
      wikiPage: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WikiService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(WikiService);
  });

  describe('findAllByCourse', () => {
    it('returns published pages for a course', async () => {
      prisma.wikiPage.findMany.mockResolvedValue([mockPage]);

      const result = await service.findAllByCourse('informatika-1');

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { slug: 'informatika-1' },
        select: { id: true },
      });
      expect(prisma.wikiPage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 1, status: 'PUBLISHED' },
          orderBy: { title: 'asc' },
        }),
      );
      expect(result).toEqual([mockPage]);
    });

    it('throws NotFoundException for unknown course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findAllByCourse('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneBySlug', () => {
    it('returns a published page', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(mockPage);

      const result = await service.findOneBySlug(
        'informatika-1',
        'uvod-v-programiraneto',
      );

      expect(prisma.wikiPage.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            courseId_slug: { courseId: 1, slug: 'uvod-v-programiraneto' },
          },
        }),
      );
      expect(result).toEqual(mockPage);
    });

    it('throws NotFoundException when page missing', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(null);

      await expect(
        service.findOneBySlug('informatika-1', 'missing'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when page is not published', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue({
        ...mockPage,
        status: 'DRAFT',
      });

      await expect(
        service.findOneBySlug('informatika-1', 'uvod-v-programiraneto'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a page with explicit slug', async () => {
      prisma.wikiPage.create.mockResolvedValue(mockPage);

      const result = await service.create(
        'informatika-1',
        {
          title: 'Увод в програмирането',
          slug: 'uvod-v-programiraneto',
          content: '# Увод',
        },
        7,
      );

      expect(prisma.wikiPage.create).toHaveBeenCalledWith({
        data: {
          courseId: 1,
          slug: 'uvod-v-programiraneto',
          title: 'Увод в програмирането',
          content: '# Увод',
          createdById: 7,
        },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          course: { select: { id: true, slug: true, title: true } },
        },
      });
      expect(result).toEqual(mockPage);
    });

    it('generates a slug from the title when not provided', async () => {
      prisma.wikiPage.create.mockResolvedValue(mockPage);

      await service.create(
        'informatika-1',
        { title: 'Увод в програмирането', content: '# Увод' },
        7,
      );

      expect(prisma.wikiPage.create).toHaveBeenCalledWith({
        data: {
          courseId: 1,
          slug: 'uvod-v-programiraneto',
          title: 'Увод в програмирането',
          content: '# Увод',
          createdById: 7,
        },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          course: { select: { id: true, slug: true, title: true } },
        },
      });
    });

    it('throws ConflictException on duplicate slug', async () => {
      prisma.wikiPage.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', {
          code: 'P2002',
          clientVersion: '6.0.0',
        }),
      );

      await expect(
        service.create(
          'informatika-1',
          { title: 'X', slug: 'uvod-v-programiraneto', content: 'c' },
          7,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates when author', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(mockPage);
      prisma.wikiPage.update.mockResolvedValue({
        ...mockPage,
        title: 'New',
      });

      const result = await service.update(1, { title: 'New' }, 7, Role.STUDENT);

      expect(prisma.wikiPage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'New' },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          course: { select: { id: true, slug: true, title: true } },
        },
      });
      expect(result.title).toBe('New');
    });

    it('throws ForbiddenException for non-author student', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(mockPage);

      await expect(
        service.update(1, { title: 'New' }, 999, Role.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows moderator to update others pages', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(mockPage);
      prisma.wikiPage.update.mockResolvedValue(mockPage);

      await service.update(1, { title: 'New' }, 999, Role.MODERATOR);

      expect(prisma.wikiPage.update).toHaveBeenCalled();
    });

    it('throws NotFoundException when missing', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { title: 'New' }, 7, Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes when author', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(mockPage);
      prisma.wikiPage.delete.mockResolvedValue(mockPage);

      await service.remove(1, 7, Role.STUDENT);

      expect(prisma.wikiPage.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws ForbiddenException for non-author student', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(mockPage);

      await expect(service.remove(1, 999, Role.STUDENT)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when missing', async () => {
      prisma.wikiPage.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 7, Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
