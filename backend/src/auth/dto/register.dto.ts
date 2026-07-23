import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ALLOWED_REGISTER_ROLES = ['GUEST', 'STUDENT', 'TEACHER'] as const;

export class RegisterDto {
  @ApiProperty({
    description: 'Пълно име на потребителя',
    example: 'Иван Иванов',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Имейл адрес', example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Парола (минимум 8 символа)',
    example: 'securePass123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Роля при регистрация',
    example: 'STUDENT',
    enum: ALLOWED_REGISTER_ROLES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_REGISTER_ROLES)
  role?: string;

  @ApiPropertyOptional({ description: 'Специалност', example: 'Информатика' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({
    description: 'Хобита и интереси',
    example: 'Програмиране, шах',
  })
  @IsOptional()
  @IsString()
  hobbies?: string;

  @ApiPropertyOptional({
    description: 'Turnstile токен за защита от ботове',
    example: '0xAAAAAAAB...',
  })
  @IsOptional()
  @IsString()
  turnstileToken?: string;
}
