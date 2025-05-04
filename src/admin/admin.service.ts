import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { AdminUserProvider } from './admin-user.provider';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly admin_usersProvider: AdminUserProvider,
  ) {}

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  async delete(id: number, password: string) {
    return this.usersService.delete(id, password);
  }

  async deleteById(id: number) {
    return this.admin_usersProvider.deleteById(id); //provider
  }

  async getById(id: number) {
    return this.admin_usersProvider.getById(id); //provider
  }

  getAll() {
    return this.admin_usersProvider.getAll(); //provider
  }
}
