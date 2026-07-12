import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { Roles } from '../common/roles.decorator';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateContactMessageDto, @Req() req: Request) {
    const userId = (req as { user?: { id: number } }).user?.id;
    return this.contactService.create(dto, userId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id/resolve')
  markResolved(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markResolved(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}
