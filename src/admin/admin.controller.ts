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
}
