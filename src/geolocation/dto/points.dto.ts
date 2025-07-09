import { Column } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PointsDto {
  @IsNotEmpty()
  @IsNumber()
  lon: number;
  //longitude

  @IsNotEmpty()
  @IsNumber()
  lat: number;
  //latitude
}
