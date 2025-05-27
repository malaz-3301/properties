import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';
import { UsersGetProvider } from './users-get.provider';
import { OtpEntity } from '../entities/otp.entity';

@Injectable()
export class UsersOtpProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(OtpEntity)
    private readonly otpEntityRepository: Repository<OtpEntity>,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly usersGetProvider: UsersGetProvider,
  ) {}

  async otpVerify(code: string, id: number) {
    const user = await this.usersGetProvider.findByIdOtp(id);
    //If Hack delete him
    if (!/^\d+$/.test(code)) {
      await this.usersRepository.delete({ id: id });
      throw new BadRequestException('(: (: (:(: hhh');
    }
    await this.otpTokenTimer(user); //Limiter & Timer
    //verify
    const isCode = await bcrypt.compare(code, user.otpEntity.otpCode);
    if (!isCode) {
      console.log('dd : ' + code);
      user.otpEntity.otpTries += 1;
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Code is incorrect');
    }
    user.isAccountVerified = true;
    user.otpEntity.otpTries = 0;
    user.otpEntity.passChangeAccess = true; //مو دائما بحاجتها resetAccount

    await this.usersRepository.save(user);
    //token
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      userType: user.userType,
    });
    return {
      accessToken,
    };
  }

  async otpTokenTimer(user: User) {
    //createAt for Expire
    //Expire
    const createdAtTimestamp = user.createdAt.getTime();
    const expireInSec = (Date.now() - createdAtTimestamp) / 1000;
    console.log('expireInSec : ' + expireInSec);
    if (expireInSec > 540) {
      throw new UnauthorizedException({
        message: 'Your code has expired',
        signUpButton: false,
      });
    }

    //Limit of tries
    if (user.otpEntity.otpTries === 3) {
      throw new UnauthorizedException({
        message: 'Too many incorrect attempts , request a new code',
        signUpButton: false,
      });
    }
  }

  async otpReSend(id: number) {
    const user = await this.usersGetProvider.findByIdOtp(id);
    if (user.isAccountVerified) {
      throw new BadRequestException('Your account has been verified');
    }
    //اختبار  وقت اخر طلب كود
    const updateAtTimestamp = user.updatedAt.getTime();
    const LastReqInSec = (Date.now() - updateAtTimestamp) / 1000;
    console.log('LastReqInSec : ' + LastReqInSec);
    //660
    if (LastReqInSec < 120) {
      throw new UnauthorizedException(`${await this.otpTimer(user.id)}`);
    }
    //مر خمس دقائق خود كود
    //OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const otpCode = await this.hashCode(code);
    const otpTries = 0; //تصفير المحاولات
    user.createdAt = new Date(); // وقتت جديد للتوكين
    user.updatedAt = new Date(); // وقت جديد لامكانية الطلب
    await this.usersRepository.save(user);
    await this.otpEntityRepository.update(user.id, {
      otpTries: otpTries,
      otpCode,
    });
    await this.sendSms('0930983492', `Your Key is ${code}`);
    return {
      message: 'Check your phone messages',
      signUpButton: true,
      userId: user.id,
    };
  }

  //فقط طلب
  async otpTimer(id: number) {
    const user = await this.usersGetProvider.findById(id);
    //اختبار  وقت اخر طلب كود
    const updateAtTimestamp = user.updatedAt.getTime();
    const LastReqInSecond = ((Date.now() - updateAtTimestamp) / 1000) % 60;
    const LastReqInMin = (Date.now() - updateAtTimestamp) / 1000 / 60;
    console.log('LastReqInSec : ' + LastReqInMin);
    return {
      'Last SMS ': `  : ${Math.floor(LastReqInMin)} minutes : ${Math.floor(LastReqInSecond)} seconds ago`,
    };
  }

  /**
   *
   * @param code
   * @private
   */
  async hashCode(code: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(code, salt);
  }

  async sendSms(phone: string, message: string) {
    const actualPhone = '+963' + phone.slice(1);
    console.log(actualPhone);
    console.log(message);
    // Hey pro
    const endpoint = this.configService.getOrThrow<string>('END_POINT');
    const token = this.configService.getOrThrow<string>('SMS_TOKEN');
    const data = {
      to: actualPhone,
      message: message,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.post(endpoint, data, {
          headers: { Authorization: token },
        }),
      );
      if (response) {
        console.log('Message sent successfully');
      } else {
        console.log('Failed to send message');
      }
    } catch (error) {
      console.log('Failed to send message');
      throw new HttpException('Failed to send message', HttpStatus.BAD_GATEWAY);
    }
  }
}
