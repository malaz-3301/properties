import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';

export class EditProAgencyDto extends PartialType(CreatePropertyDto) {}
