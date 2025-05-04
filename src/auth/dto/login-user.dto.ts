import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(9, 12)
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
