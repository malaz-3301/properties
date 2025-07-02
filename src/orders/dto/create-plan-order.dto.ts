import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanOrderDto {
  @IsNotEmpty()
  @IsString()
  planId: number;
  @IsNotEmpty()
  payment_Method_Type: string;
  @IsNotEmpty()
  dataAfterPayment: {
    success_url: string;
    cancel_url: string;
  };
}
