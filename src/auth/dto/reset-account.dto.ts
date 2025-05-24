import {
  IsEmpty,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class ResetAccountDto {
  @ValidateIf((dto) => dto.username === null)
  @IsNotEmpty()
  @IsString()
  @Length(9, 12)
  phone?: string;

  @ValidateIf((dto) => dto.phone === null)
  @IsNotEmpty()
  @IsString()
  @Length(3, 18)
  username?: string;
}
