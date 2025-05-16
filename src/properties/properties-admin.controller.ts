import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AuditInterceptor } from '../utils/interceptors/audit.interceptor';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('propertyA')
export class PropertiesAdminController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  updateProById(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.updateProById(+id, updatePropertyDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  getAll() {
    return this.propertiesService.getAll();
  }

  @Delete('delete')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  deleteProById(@Param('id') id: string) {
    return this.propertiesService.deleteProById(+id);
  }
}
