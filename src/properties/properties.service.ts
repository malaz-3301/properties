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
import { UsersOtpProvider } from '../users/users-otp.provider';
import { GeolocationService } from '../geolocation/geolocation.service';
import { PropertiesImgProvider } from './properties-img.provider';
import * as bcrypt from 'bcryptjs';
import { PropertiesDelProvider } from './properties-del.provider';
import { PropertiesGetProvider } from './properties-get.provider';

import { PropertyStatus } from '../utils/enums';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly geolocationService: GeolocationService,
    private readonly propertiesImgProvider: PropertiesImgProvider,
    private readonly propertiesDelProvider: PropertiesDelProvider,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  //create from other
  async create(createPropertyDto: CreatePropertyDto, id: number) {
    const user = await this.usersOtpProvider.findById(id);
    const { pointsDto } = createPropertyDto;
    const location = await this.geolocationService.reverse_geocoding(
      pointsDto.lat,
      pointsDto.lon,
    );
    const newProperty = this.propertyRepository.create({
      ...createPropertyDto,
      location: location,
      user: user,
    });
    return this.propertyRepository.save(newProperty);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    let estate = await this.propertiesGetProvider.findById(id);
    estate = { ...estate, ...updatePropertyDto };
    return this.propertyRepository.save(estate);
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

  async getByPropId(id: number) {
    return this.propertiesGetProvider.getByPropId(id);
  }

  async getByUserId(userId: number) {
    return this.propertiesGetProvider.getByUserId(userId);
  }

  async deleteMyProperty(id: number, userId: number, password: string) {
    return this.propertiesDelProvider.deleteMyProperty(id, userId, password);
  }

  async deletePropertyById(id: number) {
    return this.propertiesDelProvider.deletePropertyById(id);
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

  async MyProperty(id: number, userId: number) {
    return this.propertiesImgProvider.MyProperty(id, userId);
  }
}
