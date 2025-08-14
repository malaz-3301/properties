import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';
import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsEmpty({ message: "You can't change your number" })
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  myPassword: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  password: string;
}
