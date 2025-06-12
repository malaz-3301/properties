import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { PropertyStatus, PropertyType } from '../../utils/enums';
import { IsEnum } from 'class-validator';

export class UpdateProAdminDto extends PartialType(CreatePropertyDto) {
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}
