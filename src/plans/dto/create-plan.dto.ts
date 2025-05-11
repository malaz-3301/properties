import { PlanDuration, PlanType } from '../../utils/enums';
import { Column } from 'typeorm';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsEnum(PlanDuration)
  planDuration: PlanDuration;

  @IsNotEmpty()
  @IsEnum(PlanType)
  planType: PlanType;

  @IsNotEmpty()
  @IsNumber()
  planPrice: number;
}
