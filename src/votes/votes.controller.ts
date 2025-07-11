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
  UseInterceptors,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuditInterceptor } from '../utils/interceptors/audit.interceptor';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post(':proId/:value')
  @UseGuards(AuthGuard)
  create(
    @Param('proId', ParseIntPipe) proId: number,
    @Param('value', ParseIntPipe) value: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.votesService.changeVoteStatus(proId, value, user.id);
  }

  /**
   * users voters
   * @param proId
   */
  @Get('who-voted/:proId')
  @UseGuards(AuthGuard)
  getUsersVotedUp(@Param('proId', ParseIntPipe) proId: number) {
    return this.votesService.getUsersVotedUp(proId);
  }

  /**
   * who spam
   *
   */
  @Get('spammers')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.ADMIN)
  @UseInterceptors(AuditInterceptor)
  getVoteSpammers() {
    return this.votesService.getVoteSpammers();
  }
}
