import { IsNotEmpty, IsString, Length } from 'class-validator';

export class DeleteUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string;
}
