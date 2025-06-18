import { PropertyStatus, PropertyType } from '../../utils/enums';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class RejectProAdminDto {
  @IsNotEmpty()
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @IsNotEmpty()
  @IsString()
  @Length(30, 150)
  message: string;
}
