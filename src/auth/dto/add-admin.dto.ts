import {
  IsAscii,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PointsDto } from '../../geolocation/dto/points.dto';

export class AddAdminDto {
  @IsNotEmpty()
  @IsString()
  @Length(9, 12)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 18)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(14, 20)
  password: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PointsDto)
  pointsDto: PointsDto;

  @IsOptional()
  @IsNumber()
  @Min(16, { message: 'Age must not be less than 16' })
  age?: number;

  @IsString()
  @IsNotEmpty()
  @IsAscii()
  token: string;
}
