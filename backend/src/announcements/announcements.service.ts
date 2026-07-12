import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  findAll(limit?: number) {
    return this.prisma.announcement.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async create(dto: CreateAnnouncementDto) {
    try {
      return await this.prisma.announcement.create({
        data: {
          title: dto.title,
          content: dto.content,
          source: dto.source,
          sourceUrl: dto.sourceUrl,
          publishedAt: new Date(dto.publishedAt),
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Announcement already exists');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateAnnouncementDto) {
    try {
      return await this.prisma.announcement.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.content !== undefined && { content: dto.content }),
          ...(dto.source !== undefined && { source: dto.source }),
          ...(dto.sourceUrl !== undefined && { sourceUrl: dto.sourceUrl }),
          ...(dto.publishedAt !== undefined && {
            publishedAt: new Date(dto.publishedAt),
          }),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025')
          throw new NotFoundException('Announcement not found');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.announcement.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Announcement not found');
      }
      throw e;
    }
  }
}
