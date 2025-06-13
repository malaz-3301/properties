import { PropertyStatus, PropertyType } from '../../utils/enums';
import { IsEnum } from 'class-validator';

export class UpdateProAdminDto {
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}
