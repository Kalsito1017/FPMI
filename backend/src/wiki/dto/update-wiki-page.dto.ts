import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWikiPageDto {
  @ApiPropertyOptional({
    description: 'Заглавие на уики страницата',
    example: 'Увод в програмирането',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Съдържание на страницата (Markdown)',
    example: '# Увод\n\nОбновен текст...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100000)
  content?: string;
}
