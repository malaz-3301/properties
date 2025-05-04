import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { DeleteUserDto } from '../users/dto/delete-user.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  update(
    @CurrentUser() payload: JwtPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.update(payload.id, updateUserDto);
  }

  @Delete('')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  delete(
    @CurrentUser() payload: JwtPayloadType,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.adminService.delete(payload.id, deleteUserDto.password);
  }

  /**
   *
   * @param id
   */
  @Get(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getById(+id);
  }

  /**
   * GetAll
   */
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  getAll() {
    return this.adminService.getAll();
  }

  /**
   *
   * @param id
   * @param updateUserDto
   */
  @Patch(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  updateById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteById(+id);
  }
}
