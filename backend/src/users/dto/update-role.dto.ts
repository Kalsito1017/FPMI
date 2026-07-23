import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Роля на потребителя',
    example: 'MODERATOR',
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;
}
