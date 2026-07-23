import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ANNOUNCEMENT_SOURCES = [
  'facebook',
  'linkedin',
  'university',
  'manual',
] as const;

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Заглавие на обявата',
    example: 'Стажантска програма 2026',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Съдържание на обявата',
    example: 'Търсим стажанти...',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Източник на обявата',
    example: 'linkedin',
    enum: ANNOUNCEMENT_SOURCES,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ANNOUNCEMENT_SOURCES)
  source: string;

  @ApiPropertyOptional({
    description: 'URL към оригиналната обява',
    example: 'https://linkedin.com/jobs/...',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  sourceUrl?: string;

  @ApiProperty({
    description: 'Дата на публикуване',
    example: '2026-07-12T10:00:00Z',
  })
  @IsDateString()
  publishedAt: string;
}
