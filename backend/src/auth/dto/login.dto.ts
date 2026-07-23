import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Имейл адрес', example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Парола', example: 'securePass123' })
  @IsString()
  @MinLength(8)
  password: string;
}
