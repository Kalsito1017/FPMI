import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Имейл адрес за възстановяване на парола',
    example: 'ivan@example.com',
  })
  @IsEmail()
  email: string;
}
