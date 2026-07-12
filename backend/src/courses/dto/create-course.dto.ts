import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export const COURSE_CATEGORIES = [
  'Programming',
  'Mathematics',
  'Data Analytics',
  'AI',
  'Databases',
  'Networks',
  'Cybersecurity',
] as const;

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, digits, and hyphens',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(COURSE_CATEGORIES)
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  credits?: number;
}
