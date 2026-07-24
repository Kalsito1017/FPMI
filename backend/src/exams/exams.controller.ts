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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ExamsService } from './exams.service';
import { CurrentUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@ApiTags('Exams')
@Controller()
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Public()
  @Get('courses/:courseSlug/exams')
  @ApiOperation({ summary: 'Get all previous exams for a course' })
  findAll(@Param('courseSlug') courseSlug: string) {
    return this.examsService.findAllByCourse(courseSlug);
  }

  @ApiBearerAuth()
  @Post('courses/:courseSlug/exams')
  @ApiOperation({ summary: 'Add a previous exam to a course' })
  create(
    @Param('courseSlug') courseSlug: string,
    @Body() dto: CreateExamDto,
    @CurrentUser() user: User,
  ) {
    return this.examsService.create(courseSlug, dto, user.id);
  }

  @ApiBearerAuth()
  @Patch('exams/:id')
  @ApiOperation({ summary: 'Update an exam (author or moderator/admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
    @CurrentUser() user: User,
  ) {
    return this.examsService.update(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('exams/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an exam (author or moderator/admin)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.examsService.remove(id, user.id, user.role);
  }
}
