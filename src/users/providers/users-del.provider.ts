import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersGetProvider } from './users-get.provider';
import { UserType } from '../../utils/enums';
import { UsersOtpProvider } from './users-otp.provider';

@Injectable()
export class UsersDelProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersGetProvider: UsersGetProvider,
    private readonly usersOtpProvider: UsersOtpProvider,
  ) {}

  async deleteMe(id: number, password: string) {
    const user = await this.usersGetProvider.findById(id);

    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      throw new UnauthorizedException('Password is incorrect');
    }
    await this.usersRepository.delete(id);
    return user;
  }

  async deleteUserById(id: number, message: string) {
    const user = await this.usersGetProvider.findById(id);
    if (user.userType === UserType.SUPER_ADMIN) {
      throw new UnauthorizedException("You Can't");
    }
    await this.usersOtpProvider.sendSms(user.phone, message);
    await this.usersRepository.delete(id);
    return user;
  }
}
