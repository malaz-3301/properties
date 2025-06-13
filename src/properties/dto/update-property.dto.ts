import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { PropertyStatus } from '../../utils/enums';
import { IsEmpty, IsEnum } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsEmpty()
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}
