import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: number) {
    const msg = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!msg) throw new NotFoundException('Contact message not found');
    return msg;
  }

  async create(dto: CreateContactMessageDto, userId?: number) {
    return this.prisma.contactMessage.create({
      data: {
        type: dto.type,
        subject: dto.subject,
        message: dto.message,
        userId: userId ?? null,
      },
    });
  }

  async markResolved(id: number) {
    try {
      return await this.prisma.contactMessage.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Contact message not found');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.contactMessage.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Contact message not found');
      }
      throw e;
    }
  }
}
