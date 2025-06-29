import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { UsersOtpProvider } from '../users/providers/users-otp.provider';
import { GeolocationService } from '../geolocation/geolocation.service';
import { PropertiesImgProvider } from './providers/properties-img.provider';
import * as bcrypt from 'bcryptjs';
import { PropertiesDelProvider } from './providers/properties-del.provider';
import { PropertiesGetProvider } from './providers/properties-get.provider';

import { PropertyStatus, UserType } from '../utils/enums';
import { PropertiesUpdateProvider } from './providers/properties-update.provider';
import { UsersGetProvider } from '../users/providers/users-get.provider';
import { ideal, weights } from '../utils/constants';
import { UpdateProAdminDto } from './dto/update-pro-admin.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { RejectProAdminDto } from './dto/reject-pro-admin.dto';
import { UsersVoViProvider } from '../users/providers/users-vo-vi.provider';
import { AcceptProAdminDto } from './dto/accept-pro-admin.dto';
import { EditProAgencyDto } from './dto/edit-pro-agency.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private dataSource: DataSource,
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
  async create(createPropertyDto: CreatePropertyDto, ownerId: number) {
    const owner = await this.usersGetProvider.findById(ownerId);
    if (owner.plan?.id === 1) {
      throw new UnauthorizedException('Subscripe !');
    }
    const agency = await this.usersGetProvider.findById(
      createPropertyDto.agencyId,
    );

    const { pointsDto } = createPropertyDto;
    const location = await this.geolocationService.reverse_geocoding(
      pointsDto.lat,
      pointsDto.lon,
    );
    const result = await this.dataSource.transaction(async (manger) => {
      const newProperty = manger.create(Property, {
        ...createPropertyDto,
        firstImage: 'https://cdn-icons-png.flaticon.com/512/4757/4757668.png',
        location: location,
        owner: { id: owner.id },
        agency: { id: agency.id },
      });
      if (owner.id === agency.id) {
        newProperty.status = PropertyStatus.ACCEPTED;
      }
      await manger.save(Property, newProperty);
      await this.computePropertySuitability(newProperty, manger);
      await this.usersVoViProvider.incrementTotalProperties(
        agency.id,
        1,
        manger,
      );
      return newProperty;
    });
    return result.id;
  }

  async updateOwnerPro(
    proId: number,
    userId: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesUpdateProvider.updateOwnerPro(
      proId,
      userId,
      updatePropertyDto,
    );
  }

  async updateAdminPro(proId: number, updateProAdminDto: UpdateProAdminDto) {
    return this.propertiesUpdateProvider.updateAdminPro(
      proId,
      updateProAdminDto,
    );
  }

  async updateAgencyPro(
    proId: number,
    agencyId: number,
    editProAgencyDto: EditProAgencyDto,
  ) {
    return this.propertiesUpdateProvider.updateAgencyPro(
      proId,
      agencyId,
      editProAgencyDto,
    );
  }

  async acceptAgencyPro(proId: number, agencyId: number) {
    await this.propertiesUpdateProvider.acceptAgencyPro(proId, agencyId);
  }

  async rejectAgencyPro(proId: number, agencyId: number) {
    await this.propertiesUpdateProvider.rejectAgencyPro(proId, agencyId);
  }

  /*  async acceptPro(proId: number, acceptProAdminDto: AcceptProAdminDto) {
      await this.propertiesUpdateProvider.acceptProById(proId, acceptProAdminDto);
    }
  
    async rejectPro(proId: number, rejectProAdminDto: RejectProAdminDto) {
      await this.propertiesUpdateProvider.rejectProById(proId, rejectProAdminDto);
    }*/

  getAll(query: FilterPropertyDto, ownerId?: number, agencyId?: number) {
    return this.propertiesGetProvider.getAll(query, ownerId, agencyId);
  }

  async getOnePro(proId: number, userId: number) {
    return this.propertiesGetProvider.findById_ACT(proId, userId);
  }

  async getUserPro(proId: number, userId: number, role: UserType) {
    return this.propertiesGetProvider.getProByUser(proId, userId, role);
  }

  async deleteOwnerPro(proId: number, userId: number, password: string) {
    return this.propertiesDelProvider.deleteOwnerPro(proId, userId, password);
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

  /*  async removeSingleImage(id: number, userId: number) {
      return this.propertiesImgProvider.removeSingleImage(id, userId);
    }*/

  async removeAnyImg(id: number, userId: number, imageName: string) {
    return this.propertiesImgProvider.removeAnyImg(id, userId, imageName);
  }

  async computePropertySuitability(
    property: Property,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(Property)
      : this.propertyRepository;

    const [minPricePro] = await repository.find({
      order: {
        price: 'ASC',
      },
      select: { price: true },
      take: 1,
    });
    const [maxPricePro] = await repository.find({
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
    property.priorityScoreEntity.suitabilityScoreRate = score / 2;
    property.priorityScoreRate += score / 2;
    console.log('computeeee');

    return await repository.save(property);
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
