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
import { ideal, weights } from '../utils/constants';
import { UpdateProAdminDto } from './dto/update-pro-admin.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { RejectProAdminDto } from './dto/reject-pro-admin.dto';
import { UsersVoViProvider } from '../users/providers/users-vo-vi.provider';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly usersVoViProvider: UsersVoViProvider,
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
      firstImage: 'https://cdn-icons-png.flaticon.com/512/4757/4757668.png',
      location: location,
      user: {
        id: user.id,
      },
    });
    await this.propertyRepository.save(newProperty);
    await this.computePropertySuitability(newProperty);
    await this.usersVoViProvider.incrementTotalProperties(user.id, 1);
    return newProperty.id;
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

  async updateProById(id: number, updateProAdminDto: UpdateProAdminDto) {
    return this.propertiesUpdateProvider.updateProById(id, updateProAdminDto);
  }

  async rejectProById(id: number, rejectProAdminDto: RejectProAdminDto) {
    await this.propertiesUpdateProvider.updateProById(id, rejectProAdminDto);
  }

  getAll(query: FilterPropertyDto) {
    return this.propertiesGetProvider.getAll(query);
  }

  async getOnePro(proId: number, userId: number) {
    return this.propertiesGetProvider.findById_ACT(proId, userId);
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

  async computePropertySuitability(property: Property) {
    const [minPricePro] = await this.propertyRepository.find({
      order: {
        price: 'ASC',
      },
      select: { price: true },
      take: 1,
    });
    const [maxPricePro] = await this.propertyRepository.find({
      order: {
        price: 'DESC',
      },
      select: { price: true },
      take: 1,
    });
    const minPrice = minPricePro?.price ?? 0;
    const maxPrice = maxPricePro?.price ?? 0;
    const sub = maxPrice - minPrice || 1;
    let score = 0;

    score += weights.rooms * Math.min(property.rooms / ideal.rooms, 1);
    score +=
      weights.bathrooms * Math.min(property.bathrooms / ideal.bathrooms, 1);
    score += weights.area * Math.min(property.area / ideal.area, 1);
    score += weights.garden * (property.hasGarden ? 1 : 0);
    score += weights.garage * (property.hasGarage ? 1 : 0);

    // Min-Max Normalization
    let priceScore = 1 - (property.price - minPrice) / sub;
    priceScore = Math.max(0, Math.min(1, priceScore));
    score += weights.price * priceScore;
    // ideal score = 100
    return await this.propertyRepository.increment(
      { id: property.id },
      'priorityScore',
      score / 2,
    );
  }

  getTopScorePro(limit: number) {
    return this.propertyRepository.find({
      order: {
        voteScore: 'DESC',
      },
      take: limit,
    });
  }
}
