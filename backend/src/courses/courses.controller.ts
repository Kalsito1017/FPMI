import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Role } from '@prisma/client';
import { CoursesService } from './courses.service';
import { Roles } from '../common/roles.decorator';
import { Public } from '../common/public.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Public()
  @Get()
  findAll(@Query('category') category?: string) {
    return this.coursesService.findAll(category);
  }

  @Public()
  @Get('tu-sofia/specialties')
  async getTUSofiaSpecialties() {
    return this.coursesService.fetchTUSofiaSpecialties();
  }

  @Roles(Role.ADMIN)
  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.coursesService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="courses.csv"');
    res.send(csv);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.coursesService.findOne(slug);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.coursesService.importCsv(csvContent);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
