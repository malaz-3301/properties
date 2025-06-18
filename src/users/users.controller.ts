import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  ParseIntPipe,
  Query,
  ParseFloatPipe,
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
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SkipThrottle } from '@nestjs/throttler';
import { AuditInterceptor } from '../utils/interceptors/audit.interceptor';

@Controller('user')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
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
  @Roles(UserType.NORMAL_USER)
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
