import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  FindOperator,
  FindOptionsUtils,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersOtpProvider } from './providers/users-otp.provider';
import { firstValueFrom } from 'rxjs';
import { GeolocationService } from '../geolocation/geolocation.service';
import { UsersUpdateProvider } from './providers/users-update.provider';
import { UsersDelProvider } from './providers/users-del.provider';
import { UsersGetProvider } from './providers/users-get.provider';
import { UsersImgProvider } from './providers/users-img.provider';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { Plan } from '../plans/entities/plan.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OtpEntity } from './entities/otp.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
    const user = this.usersRepository.create({
      ...registerUserDto,
      location,
    });
    await this.usersRepository.save(user);
    await this.otpEntityRepository.save({
      otpCode: otpCode,
      user: { id: user.id },
    });

    await this.usersOtpProvider.sendSms(user.phone, `Your Key is ${code}`);
    await this.usersRepository.save(user);
    return {
      message: 'Verify your account',
      userId: user.id,
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

  public async getUserById(id: number) {
    return this.usersGetProvider.findById(id);
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

  async setUserPlan(userId: number, planId: number) {
    return await this.usersRepository.update(userId, {
      planId: planId,
    });
  }
}
