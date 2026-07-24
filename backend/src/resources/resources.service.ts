import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

const AUTHOR_SELECT = { select: { id: true, name: true, avatar: true } };

@Injectable()
export class ResourcesService {
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
    return this.prisma.resource.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: AUTHOR_SELECT },
    });
  }

  async create(courseSlug: string, dto: CreateResourceDto, userId: number) {
    const courseId = await this.getCourseId(courseSlug);
    return this.prisma.resource.create({
      data: {
        courseId,
        title: dto.title,
        type: dto.type ?? 'LINK',
        url: dto.url,
        createdById: userId,
      },
      include: { createdBy: AUTHOR_SELECT },
    });
  }

  async update(id: number, dto: UpdateResourceDto, userId: number, role: Role) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (
      resource.createdById !== userId &&
      role !== Role.MODERATOR &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only edit your own resources');
    }
    return this.prisma.resource.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.url !== undefined ? { url: dto.url } : {}),
      },
      include: { createdBy: AUTHOR_SELECT },
    });
  }

  async remove(id: number, userId: number, role: Role) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (
      resource.createdById !== userId &&
      role !== Role.MODERATOR &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only delete your own resources');
    }
    await this.prisma.resource.delete({ where: { id } });
  }
}
