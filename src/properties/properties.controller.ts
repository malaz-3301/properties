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
  ParseIntPipe,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateVehicleDto } from '../vehicles/dto/create-vehicle.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UpdateVehicleDto } from '../vehicles/dto/update-vehicle.dto';
import { DeleteUserDto } from '../users/dto/delete-user.dto';
import { diskStorage } from 'multer';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  getAll() {
    return this.propertiesService.getAll();
  }

  @Get(':id')
  getByPropId(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.getByPropId(id);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getMyProperties(@CurrentUser() user: JwtPayloadType) {
    return this.propertiesService.getByUserId(user.id);
  }

  //delete Dto change cwd
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteMyProperty(
    @Param('id') id: string,
    @Body() deleteUserDto: DeleteUserDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.propertiesService.deleteMyProperty(
      +id,
      user.id,
      deleteUserDto.password,
    );
  }

  @Delete('delete')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  deletePropertyById(@Param('id') id: string) {
    return this.propertiesService.deletePropertyById(+id);
  }

  /**
   *
   * @param id
   * @param file
   * @param payload
   */

  @Post('upload-img/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('Property-image'))
  //function
  uploadPropertyImg(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('File uploaded ', { file });
    return this.propertiesService.setPropertyImg(id, payload.id, file.filename);
  }

  @Post('upload-multiple-img/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('Property-images', 8))
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
    return this.propertiesService.setMultiImg(id, payload.id, filenames);
  }

  @Delete('remove-img/:id')
  @UseGuards(AuthGuard)
  removePropertyImage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.propertiesService.removePropertyImage(id, payload.id);
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

  @Get('images/:image')
  @UseGuards(AuthGuard)
  public showUploadedImage(
    @Param('image') imageName: string,
    @Res() res: Response,
  ) {
    return res.sendFile(imageName, { root: `images/vehicles` });
  }
}
