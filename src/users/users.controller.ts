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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SkipThrottle } from '@nestjs/throttler';
import { FilterUserDto } from './dto/filter-user.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('user')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private httpService: HttpService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Post('back')
  async register_back_users() {
    return this.usersService.register_back_users();
  }

  @Post('verify/:id')
  otpVerify(@Body('code') code: string, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.otpVerify(code, id);
  }

  @Get('resend/:id')
  otpReSend(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.otpReSend(id);
  }

  @Get('timer/:id')
  otpTimer(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.otpTimer(id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  updateMe(
    @CurrentUser() payload: JwtPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(payload.id, updateUserDto);
  }

  //Normal
  @Delete('')
  @Roles(UserType.Owner, UserType.AGENCY)
  @UseGuards(AuthRolesGuard)
  deleteMe(
    @CurrentUser() payload: JwtPayloadType,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.usersService.deleteMe(payload.id, deleteUserDto.password);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('File uploaded ', { file });
    return this.usersService.setProfileImage(payload.id, file.filename);
  }

  @Delete('remove-img')
  @UseGuards(AuthGuard)
  removeProfileImage(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @Get('images/:image')
  @SkipThrottle()
  public showUploadedImage(
    @Param('image') image: string,
    @Res() res: Response,
  ) {
    return res.sendFile(image, { root: `images/users` });
  }

  // لن تستخدم الهاندلر الا في حالة اهداء
  @Get('plan/:planId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN)
  setUserPlan(
    @Param('planId', ParseIntPipe) planId: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.usersService.setUserPlan(user.id, planId);
  }

  @Get('agency')
  @UseGuards(AuthGuard)
  getAllAgency(@Query() query: FilterUserDto) {
    return this.usersService.getAllAgency(query);
  }

  @Get('agency/:agencyId')
  @UseGuards(AuthGuard)
  getOneAgency(@Param('agencyId', ParseIntPipe) agencyId: number) {
    return this.usersService.getOneAgency(agencyId);
  }

  @Get(':id')
  @UseGuards(AuthRolesGuard)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Get('pro/:id')
  @UseGuards(AuthGuard)
  getUserProsById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserProsById(id);
  }
}
