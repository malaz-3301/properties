import { PlanDuration, PlanType } from '../../utils/enums';
import { Column } from 'typeorm';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsEnum(PlanDuration)
  planDuration: PlanDuration;

  @IsNotEmpty()
  @IsString()
  @Length(4, 140)
  description: string;

  @IsNotEmpty()
  @IsEnum(PlanType)
  planType: PlanType;

  @IsNotEmpty()
  @IsNumber()
  planPrice: number;
}
