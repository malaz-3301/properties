import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { Language, PropertyStatus, UserType } from '../../utils/enums';
import { PropertiesGetProvider } from './properties-get.provider';
import { UsersGetProvider } from '../../users/providers/users-get.provider';
import { GeolocationService } from '../../geolocation/geolocation.service';
import { PropertiesVoSuViProvider } from './properties-vo-su-vi.provider';
import { AgenciesVoViProvider } from '../../users/providers/agencies-vo-vi.provider';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';

import * as console from 'node:console';

@Injectable()
export class PropertiesCreateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private usersGetProvider: UsersGetProvider,
    private propertiesGetProvider: PropertiesGetProvider,
    private geolocationService: GeolocationService,
    private readonly propertiesVoViProvider: PropertiesVoSuViProvider,
    private readonly agenciesVoViProvider: AgenciesVoViProvider,
    private dataSource: DataSource,
    @Inject('GEO_SERVICE') private readonly client: ClientProxy,
  ) {}

  //create from other
  async create(createPropertyDto: CreatePropertyDto, userId: number) {
    const user = await this.usersGetProvider.findById(userId);

    //اذا مكتب لازم يشترك
    if (user.userType === UserType.AGENCY) {
      //عدد كم عقار له واختار المحدودية
      const count = await this.propertyRepository.count({
        where: {
          agency: { id: userId },
        },
      });
      if (user.plan?.id === 1) {
        throw new UnauthorizedException('Subscripe ! اشترك في خطط المكاتب');
      }
      if (count >= user.plan?.limit!) {
        throw new UnauthorizedException('limit ! وصلت للحد الأقصى من العقارات');
      }
    }
    console.log('planId : ' + user.plan?.id);

    const agency = await this.usersGetProvider.findById(
      createPropertyDto.agencyId,
    );

    const agencyInfo = await this.usersGetProvider.getOneAgencyInfo(
      createPropertyDto.agencyId,
    );

    const { pointsDto } = createPropertyDto;
    /*    const location =
          (await this.geolocationService.reverse_geocoding(
            pointsDto.lat,
            pointsDto.lon,
          )) || {};
        location['stringPoints'] = {
          type: 'Point',
          coordinates: [pointsDto.lon, pointsDto.lat],
        };*/

    const propertyCommissionRate =
      createPropertyDto.price * (agencyInfo.agencyCommissionRate ?? 1);

 if (createPropertyDto.description){
      createPropertyDto["ar_description"] = createPropertyDto.description
      createPropertyDto["en_description"] = await this.propertiesGetProvider.translate(Language.ENGLISH, createPropertyDto.description)
    }

    if (createPropertyDto.title){
      createPropertyDto["ar_title"] = createPropertyDto.title
      createPropertyDto["en_title"] = await this.propertiesGetProvider.translate(Language.ENGLISH, createPropertyDto.title)
    }

    console.log(createPropertyDto);
    const result = await this.dataSource.transaction(async (manger) => {
      const newProperty = manger.create(Property, {
        ...createPropertyDto,
        firstImage: 'https://cdn-icons-png.flaticon.com/512/4757/4757668.png',
        owner: { id: user.id },
        location: { lat: pointsDto.lat, lon: pointsDto.lon },
        agency: { id: agency.id },
        propertyCommissionRate: propertyCommissionRate,
      });
      console.log('cccccccccccccccccccccccccc');
      if (user.id === agency.id) {
        newProperty.status = PropertyStatus.ACCEPTED;
      }
      await manger.save(Property, newProperty);
      console.log('ddddddddddddddddddddddddddddddd');

      await this.propertiesVoViProvider.computeSuitabilityRatio(
        newProperty,
        manger,
      );
      await this.agenciesVoViProvider.chanePropertiesNum(agency.id, 1, manger);
      return newProperty;
    });
    //que
    this.client.emit(
      'create_property.geo',
      new RmqRecordBuilder({
        proId: result.id,
        lat: pointsDto.lat,
        lon: pointsDto.lon,
      })
        .setOptions({ persistent: true })
        .build(),
    );

    return result.id;
  }
}
