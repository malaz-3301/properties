import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { User } from '../entities/user.entity';
import { OtpEntity } from '../entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GeolocationService } from '../../geolocation/geolocation.service';
import { UsersOtpProvider } from './users-otp.provider';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';

@Injectable()
export class UsersRegisterProvider {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly geolocationService: GeolocationService,
    @Inject('GEO_SERVICE') private readonly client: ClientProxy,
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

    //DT
    const result = await this.dataSource.transaction(async (manger) => {
      const user = manger.create(User, {
        ...registerUserDto,
        plan: { id: 1 },
      });
      await manger.save(User, user);
      await manger.save(OtpEntity, {
        otpCode: otpCode,
        user: { id: user.id },
      });
      //que
      this.client.emit(
        'create_user.geo',
        new RmqRecordBuilder({
          userId: user.id,
          lat: pointsDto.lat,
          lon: pointsDto.lon,
        })
          .setOptions({ persistent: true })
          .build(),
      );

      this.client.emit(
        'create_user.sms',
        new RmqRecordBuilder({
          phone: user.phone,
          message: `Your Key is ${code}`,
        })
          .setOptions({ persistent: true })
          .build(),
      );
      return user;
    });
    return {
      message: 'Verify your account',
      userId: result.id,
    };
  }
}
