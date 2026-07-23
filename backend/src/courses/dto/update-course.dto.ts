import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { COURSE_CATEGORIES } from './create-course.dto';

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Заглавие на курса',
    example: 'Увод в програмирането',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'Категория на курса',
    example: 'Programming',
    enum: COURSE_CATEGORIES,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(COURSE_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({
    description: 'Описание на курса',
    example: 'Въведение в основите на програмирането.',
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
