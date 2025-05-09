// src/items/dto/get-items-query.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  FuelType,
  TransmissionType,
  VehicleCondition,
} from '../../utils/enums';
import { Column } from 'typeorm';

export class FilterVehicleDto {
  @IsOptional()
  @IsString()
  word?: string;

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  minYear?: string;

  @IsOptional()
  @IsString()
  maxYear?: string;

  @IsOptional()
  @IsString()
  minMileage?: string;

  @IsOptional()
  @IsString()
  maxMileage?: string;

  @IsOptional()
  //لا يحتاج تحويل
  @IsEnum(VehicleCondition)
  @IsString()
  condition: VehicleCondition;

  @IsOptional()
  @IsEnum(FuelType)
  @IsString()
  fuelType: FuelType;

  @IsOptional()
  @IsEnum(TransmissionType)
  @IsString()
  transmission: TransmissionType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') {
      console.log('dddddddddd');
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return true;
  })
  @IsBoolean()
  @IsOptional()
  isForRent?: boolean;
}
