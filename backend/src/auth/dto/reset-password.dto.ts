import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Токен за възстановяване на парола',
    example: 'a1b2c3d4...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Нова парола (минимум 8 символа)',
    example: 'newSecurePass123',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
