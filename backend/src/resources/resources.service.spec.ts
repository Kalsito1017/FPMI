import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prisma: {
    course: { findUnique: jest.Mock };
    resource: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockCourse = { id: 1, slug: 'informatika-1', title: 'Информатика I' };

  const mockResource = {
    id: 1,
    courseId: 1,
    title: 'cppreference',
    type: 'LINK',
    url: 'https://en.cppreference.com',
    createdById: 7,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      course: { findUnique: jest.fn().mockResolvedValue(mockCourse) },
      resource: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ResourcesService);
  });

  describe('findAllByCourse', () => {
    it('returns resources for a course ordered by createdAt desc', async () => {
      prisma.resource.findMany.mockResolvedValue([mockResource]);

      const result = await service.findAllByCourse('informatika-1');

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 1 },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual([mockResource]);
    });

    it('throws NotFoundException for unknown course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findAllByCourse('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a resource defaulting type to LINK', async () => {
      prisma.resource.create.mockResolvedValue(mockResource);

      const result = await service.create(
        'informatika-1',
        { title: 'cppreference', url: 'https://en.cppreference.com' },
        7,
      );

      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: {
          courseId: 1,
          title: 'cppreference',
          type: 'LINK',
          url: 'https://en.cppreference.com',
          createdById: 7,
        },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      });
      expect(result).toEqual(mockResource);
    });
  });

  describe('update', () => {
    it('updates when author', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource);
      prisma.resource.update.mockResolvedValue({
        ...mockResource,
        title: 'New',
      });

      const result = await service.update(1, { title: 'New' }, 7, Role.STUDENT);

      expect(prisma.resource.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result.title).toBe('New');
    });

    it('throws ForbiddenException for non-author student', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource);

      await expect(
        service.update(1, { title: 'New' }, 999, Role.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to update others resources', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource);
      prisma.resource.update.mockResolvedValue(mockResource);

      await service.update(1, { title: 'New' }, 999, Role.ADMIN);

      expect(prisma.resource.update).toHaveBeenCalled();
    });

    it('throws NotFoundException when missing', async () => {
      prisma.resource.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { title: 'New' }, 7, Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes when author', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource);
      prisma.resource.delete.mockResolvedValue(mockResource);

      await service.remove(1, 7, Role.STUDENT);

      expect(prisma.resource.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws ForbiddenException for non-author student', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource);

      await expect(service.remove(1, 999, Role.STUDENT)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when missing', async () => {
      prisma.resource.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 7, Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
