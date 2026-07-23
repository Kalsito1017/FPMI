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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { Roles } from '../common/roles.decorator';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact messages' })
  findAll() {
    return this.contactService.findAll();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact message by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Submit a contact message' })
  create(@Body() dto: CreateContactMessageDto, @Req() req: Request) {
    const userId = (req as { user?: { id: number } }).user?.id;
    return this.contactService.create(dto, userId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id/resolve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark contact message as resolved' })
  markResolved(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markResolved(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a contact message' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}
