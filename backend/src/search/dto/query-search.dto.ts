import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySearchDto {
  @ApiProperty({
    description: 'Заявка за търсене',
    example: 'програмиране',
  })
  @IsString()
  @MaxLength(100)
  q: string;

  @ApiPropertyOptional({
    description: 'Максимален брой резултати на тип (max 20)',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}
