import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannedService } from './banned.service';
import { CreateBannedDto } from './dto/create-banned.dto';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { AuditInterceptor } from '../utils/interceptors/audit.interceptor';

@Controller('banned')
export class BannedController {
  constructor(private readonly bannedService: BannedService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  create(@Body() createBannedDto: CreateBannedDto) {
    return this.bannedService.create(createBannedDto);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  findAll() {
    return this.bannedService.findAll();
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  remove(@Param('id') id: string) {
    return this.bannedService.remove(+id);
  }
}
