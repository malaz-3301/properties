import { Column } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PointsDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number;
  //latitude

  @IsNotEmpty()
  @IsNumber()
  lon: number;
  //longitude
}
