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
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { AuditInterceptor } from '../utils/interceptors/audit.interceptor';
import { SkipThrottle } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FilterUserDto } from './dto/filter-user.dto';

@SkipThrottle() //مؤقتا
@Controller('userA')
@UseInterceptors(CacheInterceptor)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/getUsers')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  getAllAUsers(@Query() query: FilterUserDto) {
    return this.usersService.getAllUsers(query);
  }

  @Get('/pending')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  getAllPending(@Query() query: FilterUserDto) {
    query.role = UserType.PENDING;
    return this.usersService.getAllPending(query);
  }

  @Get('getAdmins')
  @Roles(UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  getAllAdmins(@Query() query: FilterUserDto) {
    query.role = UserType.ADMIN;
    return this.usersService.getAllAdmins(query);
  }

  @Patch('upgrade/:userId')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  upgradeUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.upgradeUser(userId);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserByAdminDto: UpdateUserByAdminDto,
  ) {
    return this.usersService.updateUserById(+id, updateUserByAdminDto);
  }

  @Get(':adminId')
  @Roles(UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  getAdminById(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.usersService.getAdminById(adminId);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(AuditInterceptor)
  deleteById(
    @Param('id', ParseIntPipe) id: number,
    @Body('message') message: string,
  ) {
    return this.usersService.deleteUserById(id, message);
  }
}
