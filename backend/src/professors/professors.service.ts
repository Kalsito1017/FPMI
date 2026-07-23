import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { QueryProfessorsDto } from './dto/query-professors.dto';

@Injectable()
export class ProfessorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProfessorsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.professor.findMany({ skip, take: limit }),
      this.prisma.professor.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const professor = await this.prisma.professor.findUnique({ where: { id } });
    if (!professor) {
      throw new NotFoundException('Professor not found');
    }
    return professor;
  }

  create(dto: CreateProfessorDto) {
    return this.prisma.professor.create({ data: dto });
  }

  async update(id: number, dto: UpdateProfessorDto) {
    try {
      return await this.prisma.professor.update({ where: { id }, data: dto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Professor not found');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.professor.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Professor not found');
      }
      throw e;
    }
  }
}
