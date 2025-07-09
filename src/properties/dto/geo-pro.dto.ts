import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PointsDto } from '../../geolocation/dto/points.dto';
import { GeoEnum } from '../../utils/enums';

export class GeoProDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  lon: number;
  //longitude

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @IsNotEmpty()
  @IsEnum(GeoEnum)
  geoLevel: GeoEnum;
}
