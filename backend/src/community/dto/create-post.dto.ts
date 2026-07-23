import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Заглавие на публикацията',
    example: 'Въпрос за курс Алгебра 1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Съдържание на публикацията',
    example: 'Здравейте, имам въпрос относно...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content: string;

  @ApiPropertyOptional({
    description: 'URL на прикачено изображение',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'] })
  imageUrl?: string;
}
