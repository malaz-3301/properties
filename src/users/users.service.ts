import { ConflictException, HttpException, Injectable } from '@nestjs/common';
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
import { UserType } from '../utils/enums';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(OtpEntity)
    private readonly otpEntityRepository: Repository<OtpEntity>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly geolocationService: GeolocationService,
    private readonly usersUpdateProvider: UsersUpdateProvider,
    private readonly usersImgProvider: UsersImgProvider,
    private readonly usersGetProvider: UsersGetProvider,
    private readonly usersDelProvider: UsersDelProvider,
  ) {}

  /**
   *
   * @param registerUserDto
   */
  async register(registerUserDto: RegisterUserDto) {
    const { phone, password, pointsDto } = registerUserDto;
    if (await this.usersRepository.findOneBy({ phone: phone })) {
      throw new ConflictException('User already exists');
    }
    registerUserDto.password = await this.usersOtpProvider.hashCode(password);
    //OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const otpCode = await this.usersOtpProvider.hashCode(code);
    //
    const location = await this.geolocationService.reverse_geocoding(
      pointsDto.lat,
      pointsDto.lon,
    );
    //DT
    const result = await this.dataSource.transaction(async (manger) => {
      const user = manger.create(User, {
        ...registerUserDto,
        location,
        plan: { id: 1 },
      });

      await manger.save(User, user);
      await manger.save(OtpEntity, {
        otpCode: otpCode,
        user: { id: user.id },
      });

      await this.usersOtpProvider.sendSms(user.phone, `Your Key is ${code}`);
      return user;
    });
    return {
      message: 'Verify your account',
      userId: result.id,
    };
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
