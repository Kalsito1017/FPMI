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
import { WikiService } from './wiki.service';
import { CurrentUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { CreateWikiPageDto } from './dto/create-wiki-page.dto';
import { UpdateWikiPageDto } from './dto/update-wiki-page.dto';

@ApiTags('Wiki')
@Controller()
export class WikiController {
  constructor(private wikiService: WikiService) {}

  @Public()
  @Get('courses/:courseSlug/wiki')
  @ApiOperation({ summary: 'Get all published wiki pages for a course' })
  findAll(@Param('courseSlug') courseSlug: string) {
    return this.wikiService.findAllByCourse(courseSlug);
  }

  @Public()
  @Get('courses/:courseSlug/wiki/:pageSlug')
  @ApiOperation({ summary: 'Get a published wiki page by slug' })
  findOne(
    @Param('courseSlug') courseSlug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    return this.wikiService.findOneBySlug(courseSlug, pageSlug);
  }

  @ApiBearerAuth()
  @Post('courses/:courseSlug/wiki')
  @ApiOperation({ summary: 'Create a wiki page (published immediately)' })
  create(
    @Param('courseSlug') courseSlug: string,
    @Body() dto: CreateWikiPageDto,
    @CurrentUser() user: User,
  ) {
    return this.wikiService.create(courseSlug, dto, user.id);
  }

  @ApiBearerAuth()
  @Patch('wiki/:id')
  @ApiOperation({ summary: 'Update a wiki page (author or moderator/admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWikiPageDto,
    @CurrentUser() user: User,
  ) {
    return this.wikiService.update(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('wiki/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a wiki page (author or moderator/admin)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.wikiService.remove(id, user.id, user.role);
  }
}
