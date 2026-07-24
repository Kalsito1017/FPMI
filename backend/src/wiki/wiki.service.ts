import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWikiPageDto } from './dto/create-wiki-page.dto';
import { UpdateWikiPageDto } from './dto/update-wiki-page.dto';
import { slugify } from './slugify.util';

const AUTHOR_SELECT = { select: { id: true, name: true, avatar: true } };

@Injectable()
export class WikiService {
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
    return this.prisma.wikiPage.findMany({
      where: { courseId, status: 'PUBLISHED' },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        updatedAt: true,
        createdAt: true,
        createdBy: AUTHOR_SELECT,
      },
    });
  }

  async findOneBySlug(courseSlug: string, pageSlug: string) {
    const courseId = await this.getCourseId(courseSlug);
    const page = await this.prisma.wikiPage.findUnique({
      where: { courseId_slug: { courseId, slug: pageSlug } },
      include: {
        createdBy: AUTHOR_SELECT,
        course: { select: { id: true, slug: true, title: true } },
      },
    });
    if (!page || page.status !== 'PUBLISHED') {
      throw new NotFoundException('Wiki page not found');
    }
    return page;
  }

  async create(courseSlug: string, dto: CreateWikiPageDto, userId: number) {
    const courseId = await this.getCourseId(courseSlug);
    const slug = dto.slug ?? slugify(dto.title);
    if (!slug) {
      throw new ConflictException('Could not generate a valid slug');
    }
    try {
      return await this.prisma.wikiPage.create({
        data: {
          courseId,
          slug,
          title: dto.title,
          content: dto.content,
          createdById: userId,
        },
        include: {
          createdBy: AUTHOR_SELECT,
          course: { select: { id: true, slug: true, title: true } },
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('A page with this slug already exists');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateWikiPageDto, userId: number, role: Role) {
    const page = await this.prisma.wikiPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Wiki page not found');
    }
    if (
      page.createdById !== userId &&
      role !== Role.MODERATOR &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only edit your own pages');
    }
    return this.prisma.wikiPage.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
      },
      include: {
        createdBy: AUTHOR_SELECT,
        course: { select: { id: true, slug: true, title: true } },
      },
    });
  }

  async remove(id: number, userId: number, role: Role) {
    const page = await this.prisma.wikiPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Wiki page not found');
    }
    if (
      page.createdById !== userId &&
      role !== Role.MODERATOR &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You can only delete your own pages');
    }
    await this.prisma.wikiPage.delete({ where: { id } });
  }
}
