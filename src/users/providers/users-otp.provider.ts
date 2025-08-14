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
    //If Hack delete him اذا مو رقم
    if (!/^\d+$/.test(code)) {
      await this.usersRepository.delete({ id: id });
      throw new BadRequestException('(: (: (:(: hhh');
    }
    await this.otpTokenTimer_Limiter(user); //Limiter & Timer
    //verify
    const isCode = await bcrypt.compare(code, user.otpEntity.otpCode);
    if (!isCode) {
      //ادخال كود خاطئ
      console.log('Code : ' + code);
      user.otpEntity.otpTries += 1;
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Code is incorrect');
    }
    //اذا الكود صحيح
    user.isAccountVerified = true; // الحساب محقق
    //await this.otpEntityRepository.delete(user.id); //حذفه للسطر مالها داعي
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

  /*
   عملية ضمن otpVerify للتأكد من صلاحية وقت التوكين و منع القوة الغاشمة
   */
  async otpTokenTimer_Limiter(user: User) {
    //createAt for Expire
    //Expire
    const createdAtTimestamp = user.otpEntity.createdAt.getTime();
    const expireInSec = (Date.now() - createdAtTimestamp) / 1000;
    console.log('Date.now()  : ' + new Date(Date.now()));
    console.log('createdAt : ' + createdAtTimestamp);
    console.log('expireInSec : ' + expireInSec);
    if (expireInSec > 120) {
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

  /*
  -جبلي المستخدم مع علاقة بالotp
  -شفلي اذا المستخدم موجود
  -شفلي اذا الحساب محقق من قبل
  -شفلي اخر وقت طلب فيه الكود updatedAt
  -ولد كود وصفر المحاولات الخاطئة
  createdAt حدث اخر وقت لطلب كود updatedAt وحدث وقت صلاحية الكود-
   */
  async otpReSend(userId: number, ResetRequest: boolean = false) {
    const user = await this.usersGetProvider.findByIdOtp(userId); //otp select
    //اذا مو عملية استرداد
    if (user.isAccountVerified && !ResetRequest) {
      throw new BadRequestException('Your account has been verified');
    }

    //اختبار  وقت اخر طلب كود
    const updateAtTimestamp = user.otpEntity.updatedAt.getTime();
    const LastReqInSec = (Date.now() - updateAtTimestamp) / 1000;
    console.log('LastReqInSec : ' + LastReqInSec);
    //240
    if (LastReqInSec < 240) {
      console.log('UnauthorizedException Time');
      throw new UnauthorizedException(`${await this.otpTimer(user.id)}`);
    }
    //مر خمس دقائق خود كود
    //OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    user.otpEntity.otpCode = await this.hashCode(code);
    user.otpEntity.otpTries = 0; //تصفير المحاولات الخاطئة
    user.otpEntity.createdAt = new Date(); // verify وقتت جديد للتوكين
    user.otpEntity.updatedAt = new Date(); // وقت جديد لامكانية الطلب
    await this.usersRepository.save(user);

    await this.sendSms(user.phone, `Your Key is ${code}`);
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

  async otpCreate(userId: number) {
    await this.otpEntityRepository.save({
      user: { id: userId },
    });
    return await this.otpReSend(userId, true);
  }
}
