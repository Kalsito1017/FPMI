import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Пълно име', example: 'Иван Иванов' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

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
}
