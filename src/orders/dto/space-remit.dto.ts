import { IsNotEmpty, IsString } from 'class-validator';

export class SpaceRemitDto {
  @IsString()
  @IsNotEmpty()
  private_key: string;
  @IsString()
  @IsNotEmpty()
  payment_id: string;
}
