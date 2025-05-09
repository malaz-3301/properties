import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { JwtPayloadType } from '../utils/constants';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { DeleteUserDto } from '../users/dto/delete-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';

@Controller('vehicle')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.vehiclesService.create(createVehicleDto, user.id);
  }

  /*  @Get()
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    getAll() {
      return this.vehiclesService.getAll();
    }*/

  /**
   *
   */
  @Get('all')
  getAllAccepted(@Query() query: FilterVehicleDto) {
    return this.vehiclesService.getAll(query, 'ACCEPTED' as any);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getMyVehicles(@CurrentUser() user: JwtPayloadType) {
    return this.vehiclesService.getByUserId(user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.vehiclesService.getById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  //delete Dto change cwd
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteMyVehicle(
    @Param('id') id: string,
    @Body() deleteUserDto: DeleteUserDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.vehiclesService.deleteMyVehicle(
      +id,
      user.id,
      deleteUserDto.password,
    );
  }

  @Delete('delete')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  deleteVehicleById(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicleById(+id);
  }
}
