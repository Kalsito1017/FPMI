import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export const ANNOUNCEMENT_SOURCES = ['facebook', 'linkedin', 'university', 'manual'] as const;

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(ANNOUNCEMENT_SOURCES)
  source: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsDateString()
  publishedAt: string;
}
