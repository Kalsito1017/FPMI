import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ContactService } from './contact.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: {
    contactMessage: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockContactMessage = {
    id: 1,
    type: 'SUGGESTION',
    subject: 'Test Subject',
    message: 'Test message content here',
    status: 'OPEN',
    userId: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    user: null,
  };

  const mockContactMessageWithUser = {
    ...mockContactMessage,
    userId: 1,
    user: { id: 1, name: 'Test User', email: 'test@test.com' },
  };

  beforeEach(async () => {
    prisma = {
      contactMessage: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ContactService);
  });

  describe('findAll', () => {
    it('returns all messages ordered by createdAt desc with user include', async () => {
      prisma.contactMessage.findMany.mockResolvedValue([
        mockContactMessageWithUser,
      ]);

      const result = await service.findAll();

      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual([mockContactMessageWithUser]);
    });
  });

  describe('findOne', () => {
    it('returns message by id', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue(
        mockContactMessageWithUser,
      );

      const result = await service.findOne(1);

      expect(prisma.contactMessage.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual(mockContactMessageWithUser);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a message with userId', async () => {
      prisma.contactMessage.create.mockResolvedValue(
        mockContactMessageWithUser,
      );

      const result = await service.create(
        {
          type: 'SUGGESTION',
          subject: 'Test Subject',
          message: 'Test message content here',
        },
        1,
      );

      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          type: 'SUGGESTION',
          subject: 'Test Subject',
          message: 'Test message content here',
          userId: 1,
        },
      });
      expect(result).toEqual(mockContactMessageWithUser);
    });

    it('creates a message without userId', async () => {
      prisma.contactMessage.create.mockResolvedValue(mockContactMessage);

      const result = await service.create({
        type: 'BUG_REPORT',
        subject: 'Anonymous Bug',
        message: 'Something is broken, please fix it',
      });

      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          type: 'BUG_REPORT',
          subject: 'Anonymous Bug',
          message: 'Something is broken, please fix it',
          userId: null,
        },
      });
      expect(result).toEqual(mockContactMessage);
    });
  });

  describe('markResolved', () => {
    it('marks message as resolved', async () => {
      const resolved = {
        ...mockContactMessageWithUser,
        status: 'RESOLVED',
      };
      prisma.contactMessage.update.mockResolvedValue(resolved);

      const result = await service.markResolved(1);

      expect(prisma.contactMessage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'RESOLVED' },
      });
      expect(result.status).toBe('RESOLVED');
    });

    it('throws NotFoundException on P2025 error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.contactMessage.update.mockRejectedValue(prismaError);

      await expect(service.markResolved(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a message', async () => {
      prisma.contactMessage.delete.mockResolvedValue(mockContactMessage);

      await service.remove(1);

      expect(prisma.contactMessage.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException on P2025 error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.contactMessage.delete.mockRejectedValue(prismaError);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
