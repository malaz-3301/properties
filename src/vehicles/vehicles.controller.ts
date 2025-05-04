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

@Controller('vehicles')
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

  @Post('upload-img/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('vehicle-image'))
  //function
  uploadVehicleImg(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('File uploaded ', { file });
    return this.vehiclesService.setVehicleImg(id, payload.id, file.filename);
  }

  @Post('upload-multiple-img/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('vehicle-images', 8))
  //function
  uploadMultiImg(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    const filenames: string[] = files.map((f) => f.filename);

    console.log('File uploaded ', { files });
    return this.vehiclesService.setMultiImg(id, payload.id, filenames);
  }

  @Delete('remove-img/:id')
  @UseGuards(AuthGuard)
  removeVehicleImage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.vehiclesService.removeVehicleImage(id, payload.id);
  }

  @Delete('remove-any-img/:id/:imageName')
  @UseGuards(AuthGuard)
  removeAnyImg(
    @Param('id', ParseIntPipe) id: number,
    @Param('image') imageName: string,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.vehiclesService.removeAnyImg(id, payload.id, imageName);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  public showUploadedImage(
    @Param('image') imageName: string,
    @Res() res: Response,
  ) {
    return res.sendFile(imageName, { root: `images/vehicles` });
  }
}
