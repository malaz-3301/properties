import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from '../../users/dto/register-user.dto';

export class UpdateAdminDto extends PartialType(RegisterUserDto) {}
