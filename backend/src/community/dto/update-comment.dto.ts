import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Редактирано съдържание на коментара',
    example: 'Коригиран коментар...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
