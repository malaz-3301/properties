import {
  EstateType,
  FlooringType,
  FuelType,
  HeatingType,
  PropertyType,
  TransmissionType,
} from '../../utils/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateEstateDto {
  @IsNumber()
  rooms: number;
  @IsNumber()
  bathrooms: number;
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
  @IsEnum(EstateType)
  propertyType: EstateType;
  @IsEnum(HeatingType)
  heatingType: HeatingType;
  @IsEnum(FlooringType)
  flooringType: FlooringType;
}
