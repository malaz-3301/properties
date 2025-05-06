import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { EstateService } from './estates.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from 'src/auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { DeleteUserDto } from '../users/dto/delete-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('estates')
export class EstateController {
  constructor(private readonly estatesService: EstateService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createEstateDto: CreateEstateDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.estatesService.create(createEstateDto, user.id);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  getAll() {
    return this.estatesService.getAll();
  }

  /**
   *
   */
  @Get('all')
  getAllAccepted(
    @Query('word') word: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ) {
    return this.estatesService.getAll(
      word,
      minPrice,
      maxPrice,
      'ACCEPTED' as any,
    );
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getMyEstates(@CurrentUser() user: JwtPayloadType) {
    return this.estatesService.getByUserId(user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.estatesService.getById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstateDto: UpdateEstateDto) {
    return this.estatesService.update(+id, updateEstateDto);
  }

  //delete Dto change cwd
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteMyEstate(
    @Param('id') id: string,
    @Body() deleteUserDto: DeleteUserDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.estatesService.deleteMyEstate(
      +id,
      user.id,
      deleteUserDto.password,
    );
  }

  @Delete('delete')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  deleteEstateById(@Param('id') id: string) {
    return this.estatesService.deleteEstateById(+id);
  }
}
