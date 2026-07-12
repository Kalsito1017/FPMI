import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findUnique: jest.Mock } };
  let jwtService: { signAsync: jest.Mock };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    passwordHash: 'hashed',
    role: 'STUDENT',
    avatar: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    jwtService = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  describe('register', () => {
    it('returns safe user and token on success', async () => {
      prisma.user.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBe('token');
      expect(result.user).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'STUDENT',
        avatar: null,
        createdAt: mockUser.createdAt,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException on duplicate email', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      prisma.user.create.mockRejectedValue(error);

      await expect(
        service.register({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns safe user and token on success', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBe('token');
      expect(result.user).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'STUDENT',
        avatar: null,
        createdAt: mockUser.createdAt,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
