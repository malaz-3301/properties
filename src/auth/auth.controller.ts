import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';

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

  @Get('tokenTime')
  @UseGuards(AuthGuard)
  tokenTime(@CurrentUser() payload: JwtPayloadType) {
    return this.authService.tokenTime(payload);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    return this.authService.getCurrentUser(payload.id);
  }
}
