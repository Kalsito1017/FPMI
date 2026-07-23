import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Заглавие на публикацията',
    example: 'Въпрос за курс Алгебра 1',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Съдържание на публикацията',
    example: 'Редактирано съдържание...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50000)
  content?: string;

  @ApiPropertyOptional({
    description: 'URL на прикачено изображение',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
