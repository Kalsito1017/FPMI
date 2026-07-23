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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { ScraperService } from './scraper.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Public } from '../common/public.decorator';
import { Roles } from '../common/roles.decorator';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private announcementsService: AnnouncementsService,
    private scraperService: ScraperService,
  ) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'Get all announcements' })
  findAll(@Query('limit') limit?: string) {
    return this.announcementsService.findAll(
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Public()
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get announcement by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement' })
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post('scrape')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scrape announcements from external sources' })
  async scrape() {
    const results = await this.scraperService.scrapeAll();
    return { scraped: results };
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcement' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.remove(id);
  }
}
