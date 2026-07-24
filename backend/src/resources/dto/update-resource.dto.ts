import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RESOURCE_TYPES } from './create-resource.dto';

export class UpdateResourceDto {
  @ApiPropertyOptional({
    description: 'Заглавие на ресурса',
    example: 'cppreference — справочник по C++',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Тип на ресурса',
    example: 'VIDEO',
    enum: RESOURCE_TYPES,
  })
  @IsString()
  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  type?: (typeof RESOURCE_TYPES)[number];

  @ApiPropertyOptional({
    description: 'URL на ресурса',
    example: 'https://en.cppreference.com',
  })
  @IsString()
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'] })
  url?: string;
}
