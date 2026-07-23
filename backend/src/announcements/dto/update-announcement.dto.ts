import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ANNOUNCEMENT_SOURCES } from './create-announcement.dto';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({
    description: 'Заглавие на обявата',
    example: 'Стажантска програма 2026',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'Съдържание на обявата',
    example: 'Търсим стажанти...',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Източник на обявата',
    example: 'linkedin',
    enum: ANNOUNCEMENT_SOURCES,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(ANNOUNCEMENT_SOURCES)
  source?: string;

  @ApiPropertyOptional({
    description: 'URL към оригиналната обява',
    example: 'https://linkedin.com/jobs/...',
  })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({
    description: 'Дата на публикуване',
    example: '2026-07-12T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
