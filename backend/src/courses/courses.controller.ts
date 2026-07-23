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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import type { Response } from 'express';
import { Role } from '@prisma/client';
import { CoursesService } from './courses.service';
import { Roles } from '../common/roles.decorator';
import { Public } from '../common/public.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'Get all courses (paginated)' })
  findAll(@Query() query: QueryCoursesDto) {
    return this.coursesService.findAll(query);
  }

  @Public()
  @Get('tu-sofia/specialties')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120_000)
  @ApiOperation({ summary: 'Get TU-Sofia specialties' })
  async getTUSofiaSpecialties() {
    return this.coursesService.fetchTUSofiaSpecialties();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('export/csv')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export courses as CSV' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.coursesService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="courses.csv"');
    res.send(csv);
  }

  @Public()
  @Get(':slug')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get course by slug' })
  findOne(@Param('slug') slug: string) {
    return this.coursesService.findOne(slug);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post('import/csv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.csv$/i)) {
          return cb(
            new HttpException('Only CSV files allowed', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import courses from CSV' })
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.coursesService.importCsv(csvContent);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
