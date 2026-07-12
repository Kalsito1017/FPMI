import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @IsInt()
  @IsNotEmpty()
  postId: number;

  @IsInt()
  @IsOptional()
  parentCommentId?: number;
}
