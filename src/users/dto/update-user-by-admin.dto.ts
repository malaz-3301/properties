import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';
import { IsEmpty, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserByAdminDto extends PartialType(RegisterUserDto) {
  @IsEmpty({ message: "You can't change His number" })
  @IsString()
  phone: string;

  @IsEmpty({ message: "You can't change His password" })
  @IsString()
  @Length(6, 20)
  Password: string;
}
