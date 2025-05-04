import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';
import * as process from 'node:process';
import { MailService } from '../mail/mail.service';

import { UsersOtpProvider } from './users-otp.provider';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly usersOtpProvider: UsersOtpProvider,
  ) {}

  /**
   *
   * @param registerUserDto
   */
  async register(registerUserDto: RegisterUserDto) {
    const { phone, password } = registerUserDto;
    if (await this.usersRepository.findOneBy({ phone: phone })) {
      throw new ConflictException('User already exists');
    }
    registerUserDto.password = await this.usersOtpProvider.hashCode(password);
    //OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    registerUserDto['otpCode'] = await this.usersOtpProvider.hashCode(code);
    //
    const user = await this.usersRepository.save(registerUserDto);

    /*    try {
          await this.mailService.sendSignUpEmail(user);
        } catch (error) {
          console.log(error);
          return { accessToken };
        }*/
    await this.usersOtpProvider.sendSms(user.phone, `Your Key is ${code}`);
    return {
      message: 'Verify your account',
      userId: user.id,
    };
  }

  async otpVerify(code: string, id: number) {
    return this.usersOtpProvider.otpVerify(code, id);
  }

  async otpTimer(user: User) {
    return this.usersOtpProvider.otpTimer(user);
  }

  async otpReSend(id: number) {
    return this.usersOtpProvider.otpReSend(id);
  }

  getAll() {
    return this.usersRepository.find();
  }

  /**
   *
   * @param id
   * @param updateUserDto
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersOtpProvider.findById(id);

    const { phone, password } = updateUserDto;
    if (password) {
      user.password = await this.usersOtpProvider.hashCode(password);
    }
    await this.usersRepository.update(id, user);
    return this.usersOtpProvider.findById(id);
  }

  /**
   *
   * @param id
   * @param password
   */
  async delete(id: number, password: string) {
    const user = await this.usersOtpProvider.findById(id);
    
    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      throw new UnauthorizedException('Password is incorrect');
    }
    await this.usersRepository.delete(id);
    return user;
  }

  /**
   *  Remove Profile Image
   * @param id
   * @param profileImage
   */
  async setProfileImage(id: number, profileImage: string) {
    const user = await this.usersOtpProvider.findById(id);
    if (user.profileImage) {
      await this.removeProfileImage(id);
    }
    user.profileImage = profileImage;
    await this.usersRepository.save(user);
    return { message: 'File uploaded successfully' };
  }

  /**
   *
   * @param id
   */
  async removeProfileImage(id: number) {
    const user = await this.usersOtpProvider.findById(id);
    if (!user.profileImage) {
      throw new BadRequestException('User does not have image');
    }
    //current working directory
    const imagePath = join(
      process.cwd(),
      `./images/users/${user.profileImage}`,
    );
    unlinkSync(imagePath); //delete
    user.profileImage = null;
    return this.usersRepository.save(user);
  }
}
