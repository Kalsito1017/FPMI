import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProfessorsService } from './professors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfessorsService', () => {
  let service: ProfessorsService;
  let prisma: {
    professor: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const mockProfessor = {
    id: 1,
    name: 'Проф. Иван Петров',
    email: 'ivan.petrov@fpmi.bg',
    office: '409',
    bio: 'Преподавател по математика',
    photo: null,
  };

  beforeEach(async () => {
    prisma = {
      professor: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessorsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProfessorsService);
  });

  describe('findAll', () => {
    it('returns paginated professors', async () => {
      prisma.professor.findMany.mockResolvedValue([mockProfessor]);
      prisma.professor.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.professor.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([mockProfessor]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns professor by id', async () => {
      prisma.professor.findUnique.mockResolvedValue(mockProfessor);

      const result = await service.findOne(1);

      expect(prisma.professor.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProfessor);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.professor.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a professor', async () => {
      prisma.professor.create.mockResolvedValue(mockProfessor);

      const result = await service.create({
        name: 'Проф. Иван Петров',
        email: 'ivan.petrov@fpmi.bg',
        office: '409',
        bio: 'Преподавател по математика',
      });

      expect(prisma.professor.create).toHaveBeenCalledWith({
        data: {
          name: 'Проф. Иван Петров',
          email: 'ivan.petrov@fpmi.bg',
          office: '409',
          bio: 'Преподавател по математика',
        },
      });
      expect(result).toEqual(mockProfessor);
    });
  });

  describe('update', () => {
    it('updates a professor', async () => {
      const updated = { ...mockProfessor, name: 'Updated Name' };
      prisma.professor.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Updated Name' });

      expect(prisma.professor.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Name' },
      });
      expect(result.name).toBe('Updated Name');
    });

    it('throws NotFoundException on P2025 error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.professor.update.mockRejectedValue(prismaError);

      await expect(service.update(999, { name: 'Nope' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a professor', async () => {
      prisma.professor.delete.mockResolvedValue(mockProfessor);

      await service.remove(1);

      expect(prisma.professor.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException on P2025 error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '6.0.0' },
      );
      prisma.professor.delete.mockRejectedValue(prismaError);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
