import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PointsDto } from '../../geolocation/dto/points.dto';
import { PropertyType, FlooringType, HeatingType } from '../../utils/enums';

//غير لازم
export class CreatePropertyDto {
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

  @IsNotEmpty()
  @IsNumber()
  rooms: number;

  @IsNotEmpty()
  @IsNumber()
  bathrooms: number;

  @IsNotEmpty()
  @IsNumber()
  area: number;

  @IsBoolean()
  isFloor: boolean;

  @IsNumber()
  floorNumber: number;

  @IsBoolean()
  hasGarage: boolean;

  @IsBoolean()
  hasGarden: boolean;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsEnum(HeatingType)
  heatingType: HeatingType;

  @IsEnum(FlooringType)
  flooringType: FlooringType;
}
