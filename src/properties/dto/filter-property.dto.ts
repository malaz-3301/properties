// src/items/dto/get-items-query.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';

import {
  HeatingType,
  OrderDir,
  PropertyStatus,
  PropertyType,
} from '../../utils/enums';
import { Transform, Type } from 'class-transformer';
import { Column } from 'typeorm';

export class FilterPropertyDto {
  @IsOptional()
  @IsString()
  word?: string;

  //تابع Between بياخد string حصراً
  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsEnum(OrderDir)
  createdDir?: OrderDir;

  @IsOptional()
  @IsEnum(OrderDir)
  priceDir?: OrderDir;

  ///////////////////////

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsOptional()
  @IsEnum(PropertyType)
  heatingType: HeatingType;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  //تابع Between بياخد string حصراً
  @IsOptional()
  @IsString()
  minArea: string;

  @IsOptional()
  @IsString()
  maxArea: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isForRent?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  hasGarage: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isFloor: boolean;

  @IsOptional()
  @Min(1) // رقم الصفحة علاقل واحد
  @Type(() => Number)
  pageNum: number;

  @IsOptional()
  @Type(() => Number)
  numPerPage: number;
}
