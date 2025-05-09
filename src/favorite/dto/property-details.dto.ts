import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class PropertyDetailsDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
