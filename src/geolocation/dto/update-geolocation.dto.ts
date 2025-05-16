import { PartialType } from '@nestjs/mapped-types';
import { CreateGeolocationDto } from './create-geolocation.dto';

export class UpdateGeolocationDto extends PartialType(CreateGeolocationDto) {}
