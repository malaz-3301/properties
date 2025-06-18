import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { PropertyStatus, UserType } from '../utils/enums';
import { AuditInterceptor } from '../utils/interceptors/audit.interceptor';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateProAdminDto } from './dto/update-pro-admin.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RejectProAdminDto } from './dto/reject-pro-admin.dto';

@SkipThrottle()
@Controller('propertyA')
export class PropertiesAdminController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  updateProById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProAdminDto: UpdateProAdminDto,
  ) {
    return this.propertiesService.updateProById(id, updateProAdminDto);
  }

  @Patch('rej/:id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  rejectProById(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectProAdminDto: RejectProAdminDto,
  ) {
    return this.propertiesService.rejectProById(id, rejectProAdminDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @UseInterceptors(CacheInterceptor)
  getAll(@Query() query: FilterPropertyDto) {
    return this.propertiesService.getAll(query);
  }

  @Get('pending')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  getAllPending(@Query() query: FilterPropertyDto) {
    query.status = PropertyStatus.PENDING;
    return this.propertiesService.getAll(query);
  }

  @Delete('delete')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  deleteProById(@Param('id') id: string) {
    return this.propertiesService.deleteProById(+id);
  }
}
