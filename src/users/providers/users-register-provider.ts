import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { User } from '../entities/user.entity';
import { OtpEntity } from '../entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GeolocationService } from '../../geolocation/geolocation.service';
import { UsersOtpProvider } from './users-otp.provider';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { UserType } from '../../utils/enums';

@Injectable()
export class UsersRegisterProvider {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly geolocationService: GeolocationService,
    @Inject('GEO_SERVICE') private readonly client1: ClientProxy,
    @Inject('SMS_SERVICE') private readonly client2: ClientProxy,
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
      this.client1.emit(
        'create_user.geo',
        new RmqRecordBuilder({
          userId: user.id,
          lat: pointsDto.lat,
          lon: pointsDto.lon,
        })
          .setOptions({ persistent: true })
          .build(),
      );
      this.client2.emit(
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

  async register_back_users() {
    await this.dataSource.query(`
    TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;
  `);
    const pass = await this.usersOtpProvider.hashCode('lim1234');
    const users = [
      {
        phone: '0953266666',
        username: 'normal_user_owner',
        password: pass,
        pointsDto: {
          lat: 33.53680665392176,
          lon: 36.198938818542835,
        },
        userType: UserType.Owner,
        plan: { id: 1 },
        isAccountVerified: true,
        token:
          'eqqB3fMARmZEA3c8Qm2iri:APA91bG0VJ7TN6zIPBXO_4nNANeU2YSVKUXMVvuOHUG1y6bBLmJDEoLXv-IHJN2AZyDcRLmVKQS7VXlCGvRxQtW7I3MHelgo9IMdxZ2sxu5K9eaAEs_YWow',
      },
      {
        phone: '0953266661',
        username: 'agency',
        password: pass,
        pointsDto: {
          lat: 33.53680665392176,
          lon: 36.198938818542835,
        },
        userType: UserType.AGENCY,
        agencyInfo: {},
        plan: { id: 1 },
        isAccountVerified: true,
        token:
          'eqqB3fMARmZEA3c8Qm2iri:APA91bG0VJ7TN6zIPBXO_4nNANeU2YSVKUXMVvuOHUG1y6bBLmJDEoLXv-IHJN2AZyDcRLmVKQS7VXlCGvRxQtW7I3MHelgo9IMdxZ2sxu5K9eaAEs_YWow',
      },
      {
        phone: '0953266662',
        username: 'admin',
        password: pass,
        pointsDto: {
          lat: 33.53680665392176,
          lon: 36.198938818542835,
        },
        userType: UserType.ADMIN,
        isAccountVerified: true,
        plan: { id: 1 },
        token:
          'eqqB3fMARmZEA3c8Qm2iri:APA91bG0VJ7TN6zIPBXO_4nNANeU2YSVKUXMVvuOHUG1y6bBLmJDEoLXv-IHJN2AZyDcRLmVKQS7VXlCGvRxQtW7I3MHelgo9IMdxZ2sxu5K9eaAEs_YWow',
      },
      {
        phone: '0953266663',
        username: 'super_admin',
        password: pass,
        pointsDto: {
          lat: 33.53680665392176,
          lon: 36.198938818542835,
        },
        userType: UserType.SUPER_ADMIN,
        plan: { id: 1 },
        isAccountVerified: true,
        token:
          'eqqB3fMARmZEA3c8Qm2iri:APA91bG0VJ7TN6zIPBXO_4nNANeU2YSVKUXMVvuOHUG1y6bBLmJDEoLXv-IHJN2AZyDcRLmVKQS7VXlCGvRxQtW7I3MHelgo9IMdxZ2sxu5K9eaAEs_YWow',
      },
    ];
    await this.usersRepository.save(users);
  }
}
