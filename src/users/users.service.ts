import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersOtpProvider } from './providers/users-otp.provider';
import { firstValueFrom } from 'rxjs';
import { GeolocationService } from '../geolocation/geolocation.service';
import { UsersUpdateProvider } from './providers/users-update.provider';
import { UsersDelProvider } from './providers/users-del.provider';
import { UsersGetProvider } from './providers/users-get.provider';
import { UsersImgProvider } from './providers/users-img.provider';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';

import { OtpEntity } from './entities/otp.entity';
import { FilterUserDto } from './dto/filter-user.dto';
import { Language, UserType } from '../utils/enums';
import { UsersRegisterProvider } from './providers/users-register-provider';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersRegisterProvider: UsersRegisterProvider,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly usersUpdateProvider: UsersUpdateProvider,
    private readonly usersImgProvider: UsersImgProvider,
    private readonly usersGetProvider: UsersGetProvider,
    private readonly usersDelProvider: UsersDelProvider,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    return this.usersRegisterProvider.register(registerUserDto);
  }

  async otpVerify(code: string, id: number) {
    return this.usersOtpProvider.otpVerify(code, id);
  }

  async otpTimer(id: number) {
    return this.usersOtpProvider.otpTimer(id);
  }

  async otpReSend(id: number) {
    return this.usersOtpProvider.otpReSend(id);
  }

  getAll() {
    return this.usersRepository.find();
  }

  //مشترك
  async updateMe(id: number, updateUserDto: UpdateUserDto) {
    return this.usersUpdateProvider.updateMe(id, updateUserDto);
  }

  async updateUserById(id: number, updateUserByAdminDto: UpdateUserByAdminDto) {
    return this.usersUpdateProvider.updateUserById(id, updateUserByAdminDto);
  }

  async upgradeUser(userId) {
    return this.usersUpdateProvider.upgradeUser(userId);
  }

  public async getUserById(id: number) {
    return this.usersGetProvider.findById(id);
  }

  async getUserProsById(id: number) {
    return this.usersGetProvider.getUserProsById(id);
  }

  async getAllAgency(query: FilterUserDto) {
    query.role = UserType.AGENCY;
    return this.usersGetProvider.getAll(query);
  }

  async getOneAgency(agencyId: number) {
    return this.usersGetProvider.getOneAgency(agencyId);
  }

  async getAdminById(adminId: number) {
    return this.usersGetProvider.getAdminById(adminId);
  }

  async getAllUsers(query: FilterUserDto) {
    return this.usersGetProvider.getAll(query);
  }

  async getAllPending(query: FilterUserDto) {
    query.role = UserType.PENDING;
    return this.usersGetProvider.getAll(query);
  }

  async getAllAdmins(query: FilterUserDto) {
    query.role = UserType.ADMIN;
    return this.usersGetProvider.getAll(query);
  }

  async deleteMe(id: number, password: string) {
    return this.usersDelProvider.deleteMe(id, password);
  }

  async deleteUserById(id: number, message: string) {
    return this.usersDelProvider.deleteUserById(id, message);
  }

  async setProfileImage(id: number, profileImage: string) {
    return this.usersImgProvider.setProfileImage(id, profileImage);
  }

  async removeProfileImage(id: number) {
    return this.usersImgProvider.removeProfileImage(id);
  }

  async upgrade(userId: number, filenames: string[]) {
    return this.usersImgProvider.upgrade(userId, filenames);
  }

  async setUserPlan(userId: number, planId: number) {
    return await this.usersRepository.update(userId, {
      plan: { id: planId },
      ...(planId === 2 ? { hasUsedTrial: true } : {}),
    });
  }


}
