import { PropertyStatus, PropertyType } from '../../utils/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateProAdminDto {
  @IsNotEmpty()
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}
