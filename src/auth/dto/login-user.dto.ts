import { IsNotEmpty, IsString, Length, ValidateIf } from 'class-validator';

export class LoginUserDto {
  @ValidateIf((dto) => dto.username === null)
  @IsNotEmpty()
  @IsString()
  @Length(9, 12)
  phone?: string;

  @ValidateIf((dto: LoginUserDto) => dto.phone === null)
  @IsNotEmpty()
  @IsString()
  @Length(3, 18)
  username?: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
