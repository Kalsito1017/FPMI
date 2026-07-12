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
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProfessorsService } from './professors.service';
import { Roles } from '../common/roles.decorator';
import { Public } from '../common/public.decorator';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Controller('professors')
export class ProfessorsController {
  constructor(private professorsService: ProfessorsService) {}

  @Public()
  @Get()
  findAll() {
    return this.professorsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.professorsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post()
  create(@Body() dto: CreateProfessorDto) {
    return this.professorsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfessorDto,
  ) {
    return this.professorsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.professorsService.remove(id);
  }
}
