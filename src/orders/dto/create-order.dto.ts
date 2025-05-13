import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
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
