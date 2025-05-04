import {
  VehicleCondition,
  FuelType,
  TransmissionType,
} from '../../utils/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { CreatePropertyDto } from '../../properties/dto/create-property.dto';

export class CreateVehicleDto extends CreatePropertyDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 10)
  model: string;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsEnum(VehicleCondition)
  condition: VehicleCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage: number;

  @IsNotEmpty()
  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNotEmpty()
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  color: string;
}
