import { PropertyStatus, PropertyType } from '../../utils/enums';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PointsDto } from '../../geolocation/dto/points.dto';

//غير لازم
export class CreatePropertyDto {
  @IsNotEmpty()
  type: PropertyType;

  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 180)
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PointsDto)
  pointsDto: PointsDto;

  @IsNotEmpty()
  @IsBoolean()
  isForRent: boolean;
}
