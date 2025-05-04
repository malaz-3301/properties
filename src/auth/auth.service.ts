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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param loginUserDto
   */
  async login(loginUserDto: LoginUserDto) {
    const { phone, password } = loginUserDto;
    const user = await this.usersRepository.findOneBy({ phone });
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

    return { accessToken };
  }

  /**
   *
   * @param id
   */
  async getCurrentUser(id: number) {
    return this.findById(id);
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
