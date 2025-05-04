import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';

@Injectable()
export class UsersOtpProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async otpVerify(code: string, id: number) {
    const user = await this.findById(id);
    //If Hack delete him
    if (!/^\d+$/.test(code)) {
      await this.usersRepository.delete({ id: id });
      throw new BadRequestException('(: (: (:(: hhh');
    }
    await this.otpTimer(user); //Limiter & Timer
    //verify
    const isCode = await bcrypt.compare(code, user.otpCode);
    if (!isCode) {
      user.otpTries += 1;
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Code is incorrect');
    }
    user.isAccountVerified = true;
    user.otpTries = 0; //هل هناك داعي
    await this.usersRepository.save(user);
    //token
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      userType: user.userType,
    });
    return { accessToken };
  }

  async otpTimer(user: User) {
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
    if (user.otpTries === 3) {
      throw new UnauthorizedException({
        message: 'Too many incorrect attempts , request a new code',
        signUpButton: false,
      });
    }
  }

  async otpReSend(id: number) {
    const user = await this.findById(id);
    //اختبار  وقت اخر طلب كود
    const updateAtTimestamp = user.updatedAt.getTime();
    const LastReqInSec = (Date.now() - updateAtTimestamp) / 1000;
    console.log('LastReqInSec : ' + LastReqInSec);
    //660
    if (LastReqInSec < 120) {
      throw new UnauthorizedException('Wait 2 min for a new code');
    }

    //مر خمس دقائق خود كود
    //OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    user.otpCode = await this.hashCode(code);
    user.createdAt = new Date(); // وقتت جديد للتوكين
    user.updatedAt = new Date(); // وقت جديد لامكانية الطلب
    user.otpTries = 0; //تصفير المحاولات
    await this.usersRepository.save(user);
    await this.sendSms('0930983492', `Your Key is ${code}`);
    return {
      message: 'Check your phone messages',
      signUpButton: true,
      userId: user.id,
    };
  }

  /**
   *
   * @param id
   * @private
   */
  public async findById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
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
