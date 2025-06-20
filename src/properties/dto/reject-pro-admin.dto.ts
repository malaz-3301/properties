import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class RejectProAdminDto {
  @IsNotEmpty()
  @IsString()
  @Length(20, 150)
  message: string;
}
