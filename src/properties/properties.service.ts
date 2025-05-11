import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { UsersOtpProvider } from '../users/providers/users-otp.provider';
import { GeolocationService } from '../geolocation/geolocation.service';
import { PropertiesImgProvider } from './providers/properties-img.provider';
import * as bcrypt from 'bcryptjs';
import { PropertiesDelProvider } from './providers/properties-del.provider';
import { PropertiesGetProvider } from './providers/properties-get.provider';

import { PropertyStatus } from '../utils/enums';
import { PropertiesUpdateProvider } from './providers/properties-update.provider';
import { UsersGetProvider } from '../users/providers/users-get.provider';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly geolocationService: GeolocationService,
    private readonly usersGetProvider: UsersGetProvider,
    private readonly propertiesUpdateProvider: PropertiesUpdateProvider,
    private readonly propertiesImgProvider: PropertiesImgProvider,
    private readonly propertiesDelProvider: PropertiesDelProvider,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  //create from other
  async create(createPropertyDto: CreatePropertyDto, id: number) {
    const user = await this.usersGetProvider.findById(id);
    const { pointsDto } = createPropertyDto;
    const location = await this.geolocationService.reverse_geocoding(
      pointsDto.lat,
      pointsDto.lon,
    );
    const newProperty = this.propertyRepository.create({
      ...createPropertyDto,
      location: location,
      user: {id : id},
    });
    return this.propertyRepository.save(newProperty);
  }

  async updateMyPro(
    proId: number,
    userId: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesUpdateProvider.updateMyPro(
      proId,
      userId,
      updatePropertyDto,
    );
  }

  async updateProById(id: number, updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesUpdateProvider.updateProById(id, updatePropertyDto);
  }

  getAll(
    word?: string,
    minPrice?: string,
    maxPrice?: string,
    state?: PropertyStatus,
  ) {
    return this.propertiesGetProvider.getAll(
      word,
      minPrice,
      maxPrice,
      'ACCEPTED' as any,
    );
  }

  async getOnePro(id: number) {
    return this.propertiesGetProvider.findById(id);
  }

  async getByUserId(userId: number) {
    return this.propertiesGetProvider.getByUserId(userId);
  }

  async MyProperty(id: number, userId: number) {
    return this.propertiesImgProvider.MyProperty(id, userId);
  }

  async deleteMyPro(proId: number, userId: number, password: string) {
    return this.propertiesDelProvider.deleteMyPro(proId, userId, password);
  }

  async deleteProById(id: number) {
    return this.propertiesDelProvider.deleteProById(id);
  }

  async setSingleImg(id: number, userId: number, filename: string) {
    return this.propertiesImgProvider.setSingleImg(id, userId, filename);
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    return this.propertiesImgProvider.setMultiImg(id, userId, filenames);
  }

  async removeSingleImage(id: number, userId: number) {
    return this.propertiesImgProvider.removeSingleImage(id, userId);
  }

  async removeAnyImg(id: number, userId: number, imageName: string) {
    return this.propertiesImgProvider.removeAnyImg(id, userId, imageName);
  }

  getTopLovedPro(limit: number) {
    return this.propertyRepository.find({
      order: {
        loveCount: 'DESC',
      },
      take: limit,
      select: {
        id: true,
        title: true,
      },
    });
  }
}
