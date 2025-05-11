import { PartialType } from '@nestjs/swagger';
import { CreateLoveDto } from './create-love.dto';

export class UpdateLoveDto extends PartialType(CreateLoveDto) {}
