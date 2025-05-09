import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estate } from './entities/estate.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { UsersService } from '../users/users.service';
import { UsersOtpProvider } from '../users/users-otp.provider';
import { PropertyStatus } from '../utils/enums';
import * as bcrypt from 'bcryptjs';
import { GeolocationService } from '../geolocation/geolocation.service';
import { Property } from '../properties/entities/property.entity';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class EstateService {
  constructor(
    @InjectRepository(Estate)
    private estateRepository: Repository<Estate>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly propertiesService: PropertiesService,
  ) {}

  async create(newCreateEstateDto: CreateEstateDto, id: number) {
    const { createPropertyDto, ...createEstateDto } = newCreateEstateDto;
    const newProperty: Property = await this.propertiesService.create(
      createPropertyDto,
      id,
    );
    const newEstate = this.estateRepository.create({
      ...createEstateDto,
      property: newProperty,
    });
    //newEstate :(
    return this.estateRepository.save(newEstate);
  }

  async getAll(
    word?: string,
    minPrice?: string,
    maxPrice?: string,
    state?: PropertyStatus,
  ) {
    const filters: FindOptionsWhere<Estate>[] = [];

    // شرط البحث
    if (word) {
      filters.push({ property: { title: Like(`%${word}%`) } });
      filters.push({ property: { description: Like(`%${word}%`) } });
    }

    // شروط السعر
    const priceConditions: any = {};
    if (minPrice !== undefined && maxPrice !== undefined) {
      priceConditions.price = Between(parseInt(minPrice), parseInt(maxPrice));
    } else if (minPrice !== undefined) {
      priceConditions.price = MoreThanOrEqual(parseInt(minPrice));
    } else if (maxPrice !== undefined) {
      priceConditions.price = LessThanOrEqual(parseInt(maxPrice));
    }

    const where =
      filters.length > 0
        ? filters.map((filter) => ({ ...filter, ...priceConditions }))
        : { ...priceConditions };
    //
    const estates: Estate[] = await this.estateRepository.find({
      where,
      relations: { property: true },
      select: {
        property: {
          location: {
            country: true,
            governorate: true,
            city: true,
            quarter: true,
            street: true,
          },
        },
      },
    });
    if (!estates || estates.length === 0) {
      throw new NotFoundException('No estates found');
    }
    return estates;
  }

  async getById(id: number) {
    return await this.findById(id);
  }

  async getByUserId(userId: number) {
    return this.estateRepository.find({
      where: { property: { user: { id: userId } } },
    });
  }

  async update(id: number, updateEstateDto: UpdateEstateDto) {
    let estate = await this.findById(id);
    estate = { ...estate, ...updateEstateDto };
    return this.estateRepository.save(estate);
  }

  async deleteMyEstate(id: number, userId: number, password: string) {
    const estate = await this.estateRepository.findOne({
      //if it is mine && get password
      where: { id: id, property: { user: { id: userId } } },
      relations: { property: { user: true } },
      select: { property: { user: { password: true } } },
    });
    if (!estate) {
      throw new NotFoundException('Removed by Admin Or it is not yours');
    }
    const isPass = await bcrypt.compare(
      password,
      estate.property.user.password,
    );
    if (!isPass) {
      throw new UnauthorizedException('Password is incorrect');
    }
    return this.estateRepository.delete({ id: id });
  }

  async deleteEstateById(id: number) {
    const estate = this.findById(id);
    return this.estateRepository.delete({ id: id });
  }

  async findById(id: number) {
    const estate = await this.estateRepository.findOne({
      where: { id: id },
      relations: { property: { user: true } },
      select: {
        property: {
          user: { username: true },
        },
      },
    });
    if (!estate) {
      throw new NotFoundException('estate Not Found ');
    }
    return estate;
  }
}
