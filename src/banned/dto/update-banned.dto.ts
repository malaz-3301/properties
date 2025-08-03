import { PartialType } from '@nestjs/swagger';
import { CreateBannedDto } from './create-banned.dto';

export class UpdateBannedDto extends PartialType(CreateBannedDto) {}
