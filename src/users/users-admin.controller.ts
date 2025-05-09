import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';

@Controller('users')
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserByAdminDto: UpdateUserByAdminDto,
  ) {
    return this.usersService.updateUserById(+id, updateUserByAdminDto);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AuthRolesGuard)
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUserById(+id);
  }
}
