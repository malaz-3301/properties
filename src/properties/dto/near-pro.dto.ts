import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PointsDto } from '../../geolocation/dto/points.dto';

export class NearProDto {
  //لازم string لان كويري
  @IsNotEmpty()
  @IsNumber()
  lon: number;
  //longitude

  @IsNotEmpty()
  @IsString()
  lat: number;
  //latitude

  @IsNotEmpty()
  @IsString()
  distanceKm: number;
}
