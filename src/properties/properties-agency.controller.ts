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
import { AcceptProAdminDto } from './dto/accept-pro-admin.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { EditProAgencyDto } from './dto/edit-pro-agency.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@SkipThrottle()
@Controller('propertyG')
export class PropertiesAgencyController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Patch(':proId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.AGENCY)
  @UseInterceptors(AuditInterceptor)
  updateAgencyPro(
    @Param('proId', ParseIntPipe) proId: number,
    @CurrentUser() agency: JwtPayloadType,
    @Body() editProAgencyDto: EditProAgencyDto,
  ) {
    return this.propertiesService.updateAgencyPro(
      proId,
      agency.id,
      editProAgencyDto,
    );
  }

  @Patch('acc/:proId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.AGENCY)
  @UseInterceptors(AuditInterceptor)
  acceptAgencyPro(
    @Param('proId', ParseIntPipe) proId: number,
    @CurrentUser() agency: JwtPayloadType,
  ) {
    return this.propertiesService.acceptAgencyPro(proId, agency.id);
  }

  @Patch('rej/:id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.AGENCY)
  @UseInterceptors(AuditInterceptor)
  rejectAgencyPro(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() agency: JwtPayloadType,
  ) {
    return this.propertiesService.rejectAgencyPro(id, agency.id);
  }

  @Get('my')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.AGENCY)
  @UseInterceptors(AuditInterceptor)
  getAgencyPros(
    @Query() query: FilterPropertyDto,
    @CurrentUser() agency: JwtPayloadType,
  ) {
    return this.propertiesService.getAll(query, undefined, agency.id);
  }

  @Get('pending')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.AGENCY)
  @UseInterceptors(AuditInterceptor)
  getAllPendingAgency(
    @Query() query: FilterPropertyDto,
    @CurrentUser() agency: JwtPayloadType,
  ) {
    return this.propertiesService.getAllPendingAgency(
      query,
      undefined,
      agency.id,
    );
  }

  @Delete('remove-any-img/:id/:imageName')
  @UseGuards(AuthGuard)
  removeAnyImg(
    @Param('id', ParseIntPipe) id: number,
    @Param('image') imageName: string,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.propertiesService.removeAnyImg(id, payload.id, imageName);
  }

  /*  @Delete('delete')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.AGENCY)
    @UseInterceptors(AuditInterceptor)
    deleteAgencyPro(
      @Param('proId', ParseIntPipe) proId: number,
      @CurrentUser() agency: JwtPayloadType,
    ) {
      return this.propertiesService.deleteProById(proId);
    }*/
}
