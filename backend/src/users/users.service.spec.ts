import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { toSafeUser } from '../common/safe-user.util';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    passwordHash: 'hashed',
    role: 'STUDENT' as Role,
    avatar: null,
    specialty: null,
    hobbies: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const safeUser = toSafeUser(mockUser);

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findAll', () => {
    it('returns paginated users mapped through toSafeUser', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([safeUser]);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('returns empty data array when no users exist', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('updateRole', () => {
    it('updates user role and returns safe user', async () => {
      const updated = { ...mockUser, role: 'ADMIN' as Role };
      prisma.user.update.mockResolvedValue(updated);
      prisma.user.count.mockResolvedValue(2);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'STUDENT' as Role,
      });

      const result = await service.updateRole(1, { role: 'ADMIN' }, 99);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { role: 'ADMIN' },
      });
      expect(result).toEqual(toSafeUser(updated));
      expect(result.role).toBe('ADMIN');
    });

    it('throws ForbiddenException when changing own role', async () => {
      await expect(
        service.updateRole(99, { role: 'MODERATOR' }, 99),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when removing last admin', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN' as Role,
        id: 1,
      });

      await expect(
        service.updateRole(1, { role: 'STUDENT' }, 99),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws on P2025 error when user not found', async () => {
      prisma.user.count.mockResolvedValue(2);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'STUDENT' as Role,
      });
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.user.update.mockRejectedValue(prismaError);

      await expect(
        service.updateRole(999, { role: 'ADMIN' }, 99),
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });
});
