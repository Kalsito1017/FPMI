import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Съдържание на коментара',
    example: 'Страхотна публикация!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @ApiProperty({ description: 'ID на публикацията', example: 1 })
  @IsInt()
  @IsNotEmpty()
  postId: number;

  @ApiPropertyOptional({
    description: 'ID на родителския коментар (за отговор)',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  parentCommentId?: number;
}
