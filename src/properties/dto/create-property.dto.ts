import { PropertyStatus, PropertyType } from '../../utils/enums';
import { Location } from '../entities/location.embedded';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';

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
  location: Location;

  @IsNotEmpty()
  @IsBoolean()
  isForRent: boolean;
}
