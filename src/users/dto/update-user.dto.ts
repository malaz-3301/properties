import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';
import { IsEmpty, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsEmpty({ message: "You can't change your number" })
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  myPassword: string;
}
