import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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

@SkipThrottle() //مؤقتا
@Controller('userA')
@UseInterceptors(CacheInterceptor)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get('getAdmins')
  @Roles(UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  getAllAdmins() {
    return this.usersService.getAllAdmins();
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
