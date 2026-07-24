import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

const AUTHOR_SELECT = { select: { id: true, name: true, avatar: true } };

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  private async getCourseId(courseSlug: string): Promise<number> {
    const course = await this.prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course.id;
  }

  async findAllByCourse(courseSlug: string) {
    const courseId = await this.getCourseId(courseSlug);
    return this.prisma.exam.findMany({
      where: { courseId },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: { createdBy: AUTHOR_SELECT },
    });
  }

  async create(courseSlug: string, dto: CreateExamDto, userId: number) {
    const courseId = await this.getCourseId(courseSlug);
    return this.prisma.exam.create({
      data: {
        courseId,
        title: dto.title,
        year: dto.year,
        semester: dto.semester ?? null,
        pdfUrl: dto.pdfUrl,
        createdById: userId,
      },
      include: { createdBy: AUTHOR_SELECT },
    });
  }

  async update(id: number, dto: UpdateExamDto, userId: number, role: Role) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (
      exam.createdById !== userId &&
      role !== Role.MODERATOR &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only edit your own exams');
    }
    return this.prisma.exam.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.year !== undefined ? { year: dto.year } : {}),
        ...(dto.semester !== undefined ? { semester: dto.semester } : {}),
        ...(dto.pdfUrl !== undefined ? { pdfUrl: dto.pdfUrl } : {}),
      },
      include: { createdBy: AUTHOR_SELECT },
    });
  }

  async remove(id: number, userId: number, role: Role) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (
      exam.createdById !== userId &&
      role !== Role.MODERATOR &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only delete your own exams');
    }
    await this.prisma.exam.delete({ where: { id } });
  }
}
