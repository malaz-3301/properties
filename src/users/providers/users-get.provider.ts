import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserType } from '../../utils/enums';

@Injectable()
export class UsersGetProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // لاعد تسجل otp
  public async findById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    if (user.userType === (UserType.ADMIN || UserType.SUPER_ADMIN)) {
      throw new UnauthorizedException("You Can't");
    }
    return user;
  }

  public async getUserProsById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: { properties: true },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    /*    if (user.userType === UserType.SUPER_ADMIN) {
          throw new UnauthorizedException("You Can't");
        }*/
    return user;
  }

  public async findByIdOtp(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: { otpEntity: true },
      select: {
        otpEntity: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User or otp Not Found');
    }
    /*    if (user.userType === UserType.SUPER_ADMIN) {
          throw new UnauthorizedException("You Can't");
        }*/
    return user;
  }

  async getAdminById(adminId: number) {
    return this.usersRepository.findOne({
      where: { id: adminId },
      relations: { audits: true },
    });
  }

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async getAllAdmins() {
    return this.usersRepository.find({
      where: {
        userType: UserType.ADMIN,
      },
    });
  }
}
