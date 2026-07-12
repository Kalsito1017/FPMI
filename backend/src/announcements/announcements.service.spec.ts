import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prisma: {
    announcement: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockAnnouncement = {
    id: 1,
    title: 'Test Announcement',
    content: 'Test content',
    source: 'university',
    sourceUrl: 'https://example.com',
    publishedAt: new Date('2026-07-12'),
    createdAt: new Date('2026-07-12'),
  };

  beforeEach(async () => {
    prisma = {
      announcement: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AnnouncementsService);
  });

  describe('findAll', () => {
    it('returns all announcements ordered by publishedAt desc', async () => {
      prisma.announcement.findMany.mockResolvedValue([mockAnnouncement]);

      const result = await service.findAll();

      expect(prisma.announcement.findMany).toHaveBeenCalledWith({
        orderBy: { publishedAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual([mockAnnouncement]);
    });

    it('respects limit parameter', async () => {
      prisma.announcement.findMany.mockResolvedValue([mockAnnouncement]);

      const result = await service.findAll(3);

      expect(prisma.announcement.findMany).toHaveBeenCalledWith({
        orderBy: { publishedAt: 'desc' },
        take: 3,
      });
      expect(result).toEqual([mockAnnouncement]);
    });
  });

  describe('findOne', () => {
    it('returns announcement by id', async () => {
      prisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);

      const result = await service.findOne(1);

      expect(prisma.announcement.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockAnnouncement);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates an announcement and converts publishedAt to Date', async () => {
      prisma.announcement.create.mockResolvedValue(mockAnnouncement);

      const result = await service.create({
        title: 'Test Announcement',
        content: 'Test content',
        source: 'university',
        sourceUrl: 'https://example.com',
        publishedAt: '2026-07-12T00:00:00.000Z',
      });

      expect(prisma.announcement.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Announcement',
          content: 'Test content',
          source: 'university',
          sourceUrl: 'https://example.com',
          publishedAt: new Date('2026-07-12T00:00:00.000Z'),
        },
      });
      expect(result).toEqual(mockAnnouncement);
    });
  });

  describe('update', () => {
    it('updates an announcement', async () => {
      prisma.announcement.update.mockResolvedValue({
        ...mockAnnouncement,
        title: 'Updated Title',
      });

      const result = await service.update(1, { title: 'Updated Title' });

      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated Title' },
      });
      expect(result.title).toBe('Updated Title');
    });

    it('throws NotFoundException when not found', async () => {
      const prismaError = new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.announcement.update.mockRejectedValue(prismaError);

      await expect(service.update(999, { title: 'Nope' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes an announcement', async () => {
      prisma.announcement.delete.mockResolvedValue(mockAnnouncement);

      await service.remove(1);

      expect(prisma.announcement.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException when not found', async () => {
      const prismaError = new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.announcement.delete.mockRejectedValue(prismaError);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
