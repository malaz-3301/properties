import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { Throttle } from '@nestjs/throttler';
import { ResetAccountDto } from './dto/reset-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   *
   * @param loginUserDto
   */
  @Post('login') //201
  @HttpCode(HttpStatus.OK) //200
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('reset') //201
  resetAccount(@Body() resetAccountDto: ResetAccountDto) {
    return this.authService.resetAccount(resetAccountDto);
  }

  @Post('reset/:userId') //201
  resetPassword(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('password') resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(userId, resetPasswordDto);
  }

  @Get('tokenTime')
  @UseGuards(AuthGuard)
  tokenTime(@CurrentUser() payload: JwtPayloadType) {
    return this.authService.tokenTime(payload);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 10000, limit: 8 } }) // منفصل overwrite
  getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    return this.authService.getCurrentUser(payload.id);
  }
}
