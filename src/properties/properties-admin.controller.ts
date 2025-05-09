import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('property')
export class PropertiesAdminController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  updateProById(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.updateProById(+id, updatePropertyDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  getAll() {
    return this.propertiesService.getAll();
  }

  @Delete('delete')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  deleteProById(@Param('id') id: string) {
    return this.propertiesService.deleteProById(+id);
  }
}
