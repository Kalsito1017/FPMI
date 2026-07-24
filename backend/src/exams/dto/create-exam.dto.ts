import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateExamDto {
  @ApiProperty({
    description: 'Заглавие на изпита',
    example: 'Изпит — януари 2025',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Година на провеждане',
    example: 2025,
  })
  @IsInt()
  @Min(1990)
  @Max(CURRENT_YEAR + 1)
  year: number;

  @ApiPropertyOptional({
    description: 'Семестър (1 или 2)',
    example: 1,
    enum: [1, 2],
  })
  @IsInt()
  @IsOptional()
  @IsIn([1, 2])
  semester?: number;

  @ApiProperty({
    description: 'URL към PDF файла на изпита',
    example: 'https://example.com/exams/izpit-2025.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ protocols: ['http', 'https'] })
  pdfUrl: string;
}
