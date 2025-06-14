import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ResetAccountDto } from './dto/reset-account.dto';
import { UsersOtpProvider } from '../users/providers/users-otp.provider';
import { UsersGetProvider } from '../users/providers/users-get.provider';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly usersGetProvider: UsersGetProvider,
  ) {}

  /**
   *
   * @param loginUserDto
   */
  async login(loginUserDto: LoginUserDto) {
    const { phone, username, password } = loginUserDto;
    const user = phone //if بطريقة عمك ملاز
      ? await this.usersRepository.findOneBy({ phone: phone })
      : await this.usersRepository.findOneBy({ username: username });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      throw new UnauthorizedException('Password is incorrect');
    }
    if (!user.isAccountVerified) {
      throw new UnauthorizedException('Your account has not been verified');
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      userType: user.userType,
    });

    return {
      accessToken,
      UserType: user.userType,
    };
  }

  /**
   *
   * @param id
   */
  async getCurrentUser(id: number) {
    return this.findById(id);
  }

  async resetAccount(resetAccountDto: ResetAccountDto) {
    const { phone, username } = resetAccountDto;
    const user = phone //if بطريقة عمك ملاز
      ? await this.usersRepository.findOneBy({ phone: phone })
      : await this.usersRepository.findOneBy({ username: username });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    /*   حذف const code = Math.floor(10000 + Math.random() * 90000).toString();
        const otpCode = await this.usersOtpProvider.hashCode(code);*/
    return await this.usersOtpProvider.otpCreate(user.id); //لأنك حذفته و ارسال

    //otpVerify
  }

  async resetPassword(userId: number, resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersGetProvider.findByIdOtp(userId);
    user.password = await this.usersOtpProvider.hashCode(
      resetPasswordDto.password,
    );
    if (user.otpEntity.passChangeAccess) {
      user.otpEntity.passChangeAccess = false;
      await this.usersRepository.update(userId, {
        password: user.password,
        otpEntity: user.otpEntity,
      });
    }
  }

  tokenTime(payload) {
    const TimeBySeconds = payload.exp - Math.floor(Date.now() / 1000); // التحويل لثانية
    const hours = Math.floor(TimeBySeconds / 3600);
    const minutes = Math.floor((TimeBySeconds % 3600) / 60);
    //ملاحظة ملحوظية يتم حساب الوقت من 1970 (:
    return {
      Expires_in: ` < ${hours}h : ${minutes}m  > `,
    };
  }

  private async findById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }
}
