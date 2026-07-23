import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfessorDto {
  @ApiPropertyOptional({
    description: 'Име на преподавателя',
    example: 'проф. д-р Петър Петров',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Имейл адрес',
    example: 'p.petrov@fpmi.bg',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Кабинет', example: '421' })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiPropertyOptional({
    description: 'Биография',
    example: 'Професор по математика...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL на снимка',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  photo?: string;
}
