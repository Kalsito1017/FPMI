import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const CURRENT_YEAR = new Date().getFullYear();

export class UpdateExamDto {
  @ApiPropertyOptional({
    description: 'Заглавие на изпита',
    example: 'Изпит — януари 2025',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Година на провеждане',
    example: 2025,
  })
  @IsInt()
  @IsOptional()
  @Min(1990)
  @Max(CURRENT_YEAR + 1)
  year?: number;

  @ApiPropertyOptional({
    description: 'Семестър (1 или 2)',
    example: 2,
    enum: [1, 2],
  })
  @IsInt()
  @IsOptional()
  @IsIn([1, 2])
  semester?: number;

  @ApiPropertyOptional({
    description: 'URL към PDF файла на изпита',
    example: 'https://example.com/exams/izpit-2025.pdf',
  })
  @IsString()
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'] })
  pdfUrl?: string;
}
