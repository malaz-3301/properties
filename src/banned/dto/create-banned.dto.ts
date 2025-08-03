import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PlanDuration } from '../../utils/enums';

export class CreateBannedDto {
  @IsNotEmpty()
  @IsString()
  banDuration: string;
}
