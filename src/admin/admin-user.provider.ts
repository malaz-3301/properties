import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UsersOtpProvider } from '../users/users-otp.provider';

@Injectable()
export class AdminUserProvider {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly usersOtpProvider: UsersOtpProvider,
  ) {}

  async deleteById(id: number) {
    return this.usersRepository.delete(id);
  }

  async getById(id: number) {
    return this.usersOtpProvider.findById(id);
  }

  async getAll() {
    const users = await this.usersRepository.find();
    if (!users) {
      throw new NotFoundException('No users found');
    }
    return users;
  }
}
