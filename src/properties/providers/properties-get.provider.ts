import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { FilterPropertyDto } from '../dto/filter-property.dto';
import { FavoriteService } from '../../favorite/favorite.service';
import { VotesService } from '../../votes/votes.service';
import { UserType } from '../../utils/enums';
import { json } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class PropertiesGetProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly favoriteService: FavoriteService,
    @Inject(forwardRef(() => VotesService))
    private readonly votesService: VotesService,
  ) {}

  async getProByUser(proId: number, userId: number, role: UserType) {
    const property = await this.propertyRepository.findOne({
      where: { id: proId, [role]: { id: userId } },
    });
    if (!property) {
      throw new NotFoundException('property not found!');
    }
    return property;
  }

  async getUserIdByProId(proId: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: proId },
      relations: { agency: true },
      select: { agency: { id: true, phone: true } },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  async findById(proId: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: proId },
      relations: { agency: true },
      select: {
        agency: { id: true, username: true },
      },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  //جلب العقار مع تفاعلاتي عليه
  async findById_ACT(proId: number, userId: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: proId },
      relations: { agency: true },
      select: {
        agency: { id: true, username: true },
      },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const isFavorite = await this.favoriteService.isFavorite(userId, proId);
    const voteValue = await this.votesService.isVote(proId, userId);
    return {
      ...property,
      isFavorite,
      voteValue,
    };
  }

  async shortHash(obj: object) {
    //ينشئ كائن تجزئة باستخدام خوارزمية MD5
    return createHash('md5').update(JSON.stringify(obj)).digest('hex');
  }

  ////////////////

  async getAll(query: FilterPropertyDto, ownerId?: number, agencyId?: number) {
    const {
      word, //بحث
      minPrice, //سعر
      maxPrice, //سعر
      minArea, //مساحة
      maxArea, //مساحة
      status, //حالة العقار
      propertyType, //نوع العقار
      heatingType, //نوع التدفئة
      rooms, //عدد الغرف
      bathrooms, //عدد الحمامات
      isForRent, //هل هو للايجار
      hasGarage, //هل لديه كراج
      isFloor, //هل طابق ارضي
      createdDir, //ترتيب التاريخ تصاعدي او تنازلي
      priceDir, //ترتيب السعر تصاعدي او تنازلي
    } = query;
    const obj = { ...query, ownerId, agencyId };
    const key = await this.shortHash(obj);
    const cacheData = await this.cacheManager.get(key);
    if (cacheData) {
      console.log('This is Cache data');
      return cacheData;
    }

    const filter: FindOptionsWhere<Property> | undefined = {};

    filter.price = this.rangeConditions(minPrice, maxPrice);
    filter.area = this.rangeConditions(minArea, maxArea);
    if (status != null) filter.status = status;
    if (propertyType != null) filter.propertyType = propertyType;
    if (heatingType != null) filter.heatingType = heatingType;
    if (rooms != null) filter.rooms = rooms;
    if (bathrooms != null) filter.bathrooms = bathrooms;
    if (isForRent != null) filter.isForRent = isForRent;
    if (hasGarage != null) filter.hasGarage = hasGarage;
    if (isFloor != null) filter.isFloor = isFloor;
    if (agencyId != null) filter.agency = { id: agencyId };
    if (ownerId != null) filter.owner = { id: ownerId };

    let where: FindOptionsWhere<Property>[];
    if (word) {
      where = [
        { ...filter, title: Like(`%${word}%`) },
        { ...filter, description: Like(`%${word}%`) },
      ];
    } else {
      // إذا ما في كلمة بحث، نستخدم كل الشروط مجتمعة
      where = [filter];
    }
    //ORDER
    const order: FindOptionsOrder<Property> | undefined = {};
    if (createdDir != null) {
      order.createdAt = createdDir;
    }
    if (priceDir != null) {
      order.price = priceDir;
    }

    const properties: Property[] = await this.propertyRepository.find({
      where,
      relations: { agency: true, favorites: true },
      select: {
        favorites: { id: true },
        id: true,
        title: true,
        rooms: true,
        bathrooms: true,
        area: true,
        price: true,
        firstImage: true,
        status: true,
        isForRent: true,
        propertyType: true,
        location: {
          country: true,
          governorate: true,
          city: true,
          quarter: true,
          street: true,
          lon: true,
          lat: true,
        },

        agency: { username: true },
      },

      order,
    });
    if (!properties || properties.length === 0) {
      throw new NotFoundException('No estates found');
    }
    //key , value
    await this.cacheManager.set(key, properties);
    return properties;
  }

  rangeConditions(minRange?: string, maxRange?: string) {
    if (minRange && maxRange) {
      return Between(parseInt(minRange), parseInt(maxRange));
    } else if (minRange) {
      return MoreThanOrEqual(parseInt(minRange));
    } else if (maxRange) {
      return LessThanOrEqual(parseInt(maxRange));
    }
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
