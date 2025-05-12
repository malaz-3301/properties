import { PartialType } from '@nestjs/swagger';
import { CreateCornDto } from './create-corn.dto';

export class UpdateCornDto extends PartialType(CreateCornDto) {}
