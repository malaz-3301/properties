import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersGetProvider } from './users-get.provider';

@Injectable()
export class UsersDelProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersGetProvider: UsersGetProvider,
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

  async deleteUserById(id: number) {
    const user = await this.usersGetProvider.findById(id);
    await this.usersRepository.delete(id);
    return user;
  }
}
