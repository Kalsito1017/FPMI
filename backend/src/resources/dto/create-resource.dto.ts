import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const RESOURCE_TYPES = [
  'LINK',
  'VIDEO',
  'DOCUMENT',
  'BOOK',
  'OTHER',
] as const;

export class CreateResourceDto {
  @ApiProperty({
    description: 'Заглавие на ресурса',
    example: 'cppreference — справочник по C++',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Тип на ресурса',
    example: 'LINK',
    enum: RESOURCE_TYPES,
  })
  @IsString()
  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  type?: (typeof RESOURCE_TYPES)[number];

  @ApiProperty({
    description: 'URL на ресурса',
    example: 'https://en.cppreference.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ protocols: ['http', 'https'] })
  url: string;
}
