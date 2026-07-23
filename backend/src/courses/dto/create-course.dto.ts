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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'Заглавие на курса',
    example: 'Увод в програмирането',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'URL-friendly идентификатор',
    example: 'uvod-v-programiraneto',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, digits, and hyphens',
  })
  slug: string;

  @ApiProperty({
    description: 'Категория на курса',
    example: 'Programming',
    enum: COURSE_CATEGORIES,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(COURSE_CATEGORIES)
  category: string;

  @ApiPropertyOptional({
    description: 'Описание на курса',
    example: 'Въведение в основите на програмирането с Python.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Семестър (1-8)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  semester?: number;

  @ApiPropertyOptional({ description: 'Кредити', example: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  credits?: number;
}
