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
  ValidateNested,
} from 'class-validator';
import { CreatePropertyDto } from '../../properties/dto/create-property.dto';
import { Type } from 'class-transformer';

export class CreateEstateDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePropertyDto)
  createPropertyDto: CreatePropertyDto;

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
