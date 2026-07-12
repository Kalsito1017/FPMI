import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum ContactMessageType {
  SUGGESTION = 'SUGGESTION',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
  SPAM = 'SPAM',
  OTHER = 'OTHER',
}

export class CreateContactMessageDto {
  @IsEnum(ContactMessageType)
  type: ContactMessageType;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
