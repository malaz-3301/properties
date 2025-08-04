import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { UserType } from '../../utils/enums';
import { FilterPropertyDto } from '../../properties/dto/filter-property.dto';
import { Property } from '../../properties/entities/property.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { FilterUserDto } from '../dto/filter-user.dto';
import { AgencyInfo } from '../entities/agency-info.entity';
import { createHash } from 'crypto';

@Injectable()
export class UsersGetProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AgencyInfo)
    private readonly agencyInfoRepository: Repository<AgencyInfo>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // لاعد تسجل otp
  public async findById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    console.log(user.userType + "ldksjl");
    if (user.userType === (UserType.ADMIN || UserType.SUPER_ADMIN)) {
      throw new UnauthorizedException("You Can't its not user or agency");
    }
    return user;
  }

  public async getUserProsById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: { agencyProperties: true },
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
    return await this.usersRepository.findOne({
      where: { id: adminId },
      relations: { audits: true },
    });
  }

  async getOneAgency(agencyId: number) {
    return this.usersRepository.findOneBy({ id: agencyId });
  }

  async getOneAgencyInfo(agencyId: number) {
    const agencyInfo = await this.agencyInfoRepository.findOneBy({
      user_id: agencyId,
    });
    if (!agencyInfo) {
      throw new NotFoundException('User Not Found');
    }
    return agencyInfo;
  }

  async getAll(query: FilterUserDto) {
    const { word, role } = query;
    const filters: FindOptionsWhere<User>[] = [];

    const key = await this.shortHash(query);
    const cacheData = await this.cacheManager.get(key);
    if (cacheData) {
      console.log('This is Cache data');
      return cacheData;
    }
    // شرط البحث
    if (word) {
      const cacheData = await this.cacheManager.get('users');
      if (cacheData) {
        console.log('Cache data'); //
        return cacheData;
      }
      filters.push({ username: Like(`%${word}%`) });
    }
    if (role != null) {
      filters.push({ userType: role });
      console.log(role);
    }

    // شروط السعر

    const where = Object.assign({}, ...filters);
    console.log(where);
    const users: User[] = await this.usersRepository.find({
      where,
    });
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }

    await this.cacheManager.set(key, users);
    return users;
  }

  async shortHash(obj: object) {
    //ينشئ كائن تجزئة باستخدام خوارزمية MD5
    return createHash('md5').update(JSON.stringify(obj)).digest('hex');
  }
}
