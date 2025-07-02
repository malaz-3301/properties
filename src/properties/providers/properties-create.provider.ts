import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { PropertyStatus } from '../../utils/enums';
import { PropertiesGetProvider } from './properties-get.provider';
import { UsersGetProvider } from '../../users/providers/users-get.provider';
import { GeolocationService } from '../../geolocation/geolocation.service';
import { PropertiesVoSuViProvider } from './properties-vo-su-vi.provider';
import { AgenciesVoViProvider } from '../../users/providers/agencies-vo-vi.provider';

@Injectable()
export class PropertiesCreateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private usersGetProvider: UsersGetProvider,
    private geolocationService: GeolocationService,
    private readonly propertiesVoViProvider: PropertiesVoSuViProvider,
    private readonly agenciesVoViProvider: AgenciesVoViProvider,
    private dataSource: DataSource,
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

    const agencyInfo = await this.usersGetProvider.getOneAgencyInfo(
      createPropertyDto.agencyId,
    );

    const { pointsDto } = createPropertyDto;
    const location = await this.geolocationService.reverse_geocoding(
      pointsDto.lat,
      pointsDto.lon,
    );
    const propertyCommissionRate =
      createPropertyDto.price * (agencyInfo.agencyCommissionRate ?? 1);

    const result = await this.dataSource.transaction(async (manger) => {
      const newProperty = manger.create(Property, {
        ...createPropertyDto,
        firstImage: 'https://cdn-icons-png.flaticon.com/512/4757/4757668.png',
        location: location,
        owner: { id: owner.id },
        agency: { id: agency.id },
        propertyCommissionRate: propertyCommissionRate,
      });
      if (owner.id === agency.id) {
        newProperty.status = PropertyStatus.ACCEPTED;
      }
      await manger.save(Property, newProperty);
      await this.propertiesVoViProvider.computeSuitabilityRatio(
        newProperty,
        manger,
      );
      await this.agenciesVoViProvider.chanePropertiesNum(agency.id, 1, manger);
      return newProperty;
    });
    return result.id;
  }
}
