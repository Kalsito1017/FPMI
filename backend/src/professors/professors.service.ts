import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Injectable()
export class ProfessorsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.professor.findMany();
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
