import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ContactMessageType {
  SUGGESTION = 'SUGGESTION',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
  SPAM = 'SPAM',
  OTHER = 'OTHER',
}

export class CreateContactMessageDto {
  @ApiProperty({
    description: 'Тип на съобщението',
    example: 'SUGGESTION',
    enum: ContactMessageType,
  })
  @IsEnum(ContactMessageType)
  type: ContactMessageType;

  @ApiProperty({
    description: 'Тема на съобщението',
    example: 'Предложение за нов курс',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Съдържание на съобщението',
    example: 'Бих искал да предложа добавянето на курс по...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
