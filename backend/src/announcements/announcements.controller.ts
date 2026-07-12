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
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { ScraperService } from './scraper.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Public } from '../common/public.decorator';
import { Roles } from '../common/roles.decorator';

@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private announcementsService: AnnouncementsService,
    private scraperService: ScraperService,
  ) {}

  @Public()
  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.announcementsService.findAll(
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post('scrape')
  async scrape() {
    const results = await this.scraperService.scrapeAll();
    return { scraped: results };
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.remove(id);
  }
}
