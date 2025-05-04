import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(9, 12)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 18)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string;

  @IsOptional()
  @IsNumber()
  @Min(16, { message: 'Age must not be less than 16' })
  age?: number;
}
