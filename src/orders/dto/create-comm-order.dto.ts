import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommOrderDto {
  @IsNotEmpty()
  @IsString()
  proId: number;
  
  @IsNotEmpty()
  payment_Method_Type: string;
  @IsNotEmpty()
  dataAfterPayment: {
    success_url: string;
    cancel_url: string;
  };
}
