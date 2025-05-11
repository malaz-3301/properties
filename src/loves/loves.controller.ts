import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LovesService } from './loves.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';

@Controller('loves')
export class LovesController {
  constructor(private readonly lovesService: LovesService) {}

  @Post(':proId')
  @UseGuards(AuthGuard)
  create(
    @Param('proId', ParseIntPipe) proId: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.lovesService.create(proId, user.id);
  }

  @Delete(':proId')
  @UseGuards(AuthGuard)
  remove(
    @Param('proId', ParseIntPipe) proId: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.lovesService.remove(proId, user.id);
  }

  /**
   * users lovers
   * @param proId
   */
  @Get('who-loved/:proId')
  @UseGuards(AuthGuard)
  getUserLovesOnPro(@Param('proId', ParseIntPipe) proId: number) {
    return this.lovesService.getUserLovesOnPro(proId);
  }

  @Get('love-count')
  @UseGuards(AuthGuard)
  getMyProsLovesC(@CurrentUser() user: JwtPayloadType) {
    return this.lovesService.getUserProsLovesC(user.id);
  }

  @Get('love-count/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.ADMIN)
  getUserProsLovesC(@Param('userId', ParseIntPipe) userId: number) {
    return this.lovesService.getUserProsLovesC(userId);
  }

  /**
   * loves who did
   * @param userId
   */
  @Get('user/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.ADMIN)
  getUserLovesC(@Param('userId', ParseIntPipe) userId: number) {
    return this.lovesService.getUserLovesC(userId);
  }

  /**
   * who spam
   *
   */
  @Get('spammers')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.ADMIN)
  getUsersSpam() {
    return this.lovesService.getUsersSpam();
  }
}
