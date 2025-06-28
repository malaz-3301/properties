// src/items/dto/get-items-query.dto.ts
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

import { PropertyStatus } from '../../utils/enums';

export class FilterPropertyDto {
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
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsNumber()
  ownerId?: number;

  @IsOptional()
  @IsNumber()
  agencyId?: number;

  /*  @IsOptional()
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    })
    @IsBoolean()
    @IsOptional()
    status?: boolean;*/
}
