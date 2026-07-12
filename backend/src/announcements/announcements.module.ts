import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { ScraperService } from './scraper.service';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, ScraperService],
})
export class AnnouncementsModule {}
