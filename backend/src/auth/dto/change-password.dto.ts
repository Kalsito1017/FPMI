import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Текуща парола', example: 'oldPass123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Нова парола (минимум 8 символа)',
    example: 'newSecurePass123',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
