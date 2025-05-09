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
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { DeleteUserDto } from '../users/dto/delete-user.dto';
import { diskStorage } from 'multer';

@Controller('property')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.propertiesService.create(createPropertyDto, user.id);
  }

  @Patch('my:id')
  @UseGuards(AuthGuard)
  updateMyPro(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.updateMyPro(+id, user.id, updatePropertyDto);
  }

  @Get('all')
  getAllAccepted(
    @Query('word') word: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ) {
    return this.propertiesService.getAll(
      word,
      minPrice,
      maxPrice,
      'ACCEPTED' as any,
    );
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getMyPro(@CurrentUser() user: JwtPayloadType) {
    return this.propertiesService.getByUserId(user.id);
  }

  @Get(':id')
  getByProId(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.getByProId(id);
  }

  //delete Dto change cwd
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteMyPro(
    @Param('id') id: string,
    @Body() deleteUserDto: DeleteUserDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.propertiesService.deleteMyPro(
      +id,
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

  @Delete('remove-img/:id')
  @UseGuards(AuthGuard)
  removeSingleImage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.propertiesService.removeSingleImage(id, payload.id);
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
