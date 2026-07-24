import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWikiPageDto {
  @ApiProperty({
    description: 'Заглавие на уики страницата',
    example: 'Увод в програмирането',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description:
      'URL slug на страницата (малки букви, цифри и тирета). Ако липсва, се генерира от заглавието.',
    example: 'uvod-v-programiraneto',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers and hyphens',
  })
  @MaxLength(200)
  slug?: string;

  @ApiProperty({
    description: 'Съдържание на страницата (Markdown)',
    example: '# Увод\n\nТекст на страницата...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)
  content: string;
}
