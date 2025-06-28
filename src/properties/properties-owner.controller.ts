import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyStatus } from '../utils/enums';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DeleteUserDto } from '../users/dto/delete-user.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { diskStorage } from 'multer';

//@UseInterceptors(CacheInterceptor)
@Controller('propertyN')
//@Res not work with Cache Interceptor
export class PropertiesOwnerController {
  ///
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() owner: JwtPayloadType,
  ) {
    return this.propertiesService.create(createPropertyDto, owner.id);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getOwnerPros(
    @CurrentUser() owner: JwtPayloadType,
    @Query() query: FilterPropertyDto,
  ) {
    query.ownerId = owner.id;
    return this.propertiesService.getAll(query);
  }

  @Patch('my/:proId')
  @UseGuards(AuthGuard)
  updateOwnerPro(
    @Param('proId', ParseIntPipe) proId: number,
    @CurrentUser() owner: JwtPayloadType,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.updateOwnerPro(
      proId,
      owner.id,
      updatePropertyDto,
    );
  }

  //delete Dto change cwd
  @Delete(':proId')
  @UseGuards(AuthGuard)
  deleteOwnerPro(
    @Param('proId', ParseIntPipe) proId: number,
    @Body() deleteUserDto: DeleteUserDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.propertiesService.deleteOwnerPro(
      proId,
      user.id,
      deleteUserDto.password,
    );
  }

  @Post('upload-img/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('property-image'))
  //function
  uploadSingleImg(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('File uploaded ', { file });
    return this.propertiesService.setSingleImg(id, payload.id, file.filename);
  }

  @Post('upload-multiple-img/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('property-images', 8))
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
    //من الغرض بس الاسم
    const filenames: string[] = files.map((f) => f.filename);

    console.log('File uploaded ', { files });
    return this.propertiesService.setMultiImg(id, payload.id, filenames);
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

  /*  @Delete('remove-img/:proId')
    @UseGuards(AuthGuard)
    removeSingleImage(
      @Param('proId', ParseIntPipe) proId: number,
      @CurrentUser() user: JwtPayloadType,
    ) {
      return this.propertiesService.removeSingleImage(proId, user.id);
    }*/
}
