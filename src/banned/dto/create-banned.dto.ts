import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { PlanDuration } from '../../utils/enums';

export class CreateBannedDto {
  @IsNotEmpty()
  @IsString()
  @Length(8, 80)
  reason: string;

  @IsNotEmpty()
  @IsString()
  banDuration: string;
}
