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
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { FilterPropertyDto } from '../dto/filter-property.dto';
import { FavoriteService } from '../../favorite/favorite.service';
import { VotesService } from '../../votes/votes.service';

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

  async getByUserId(userId: number) {
    return this.propertyRepository.find({
      where: { user: { id: userId } },
    });
  }

  async MyProperty(id: number, userId: number) {
    const property = this.propertyRepository.find({
      where: { id: id, user: { id: userId } },
    });
    if (!property) {
      throw new NotFoundException('property not found!');
    }
    return property;
  }

  async getUserIdByProId(proId: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: proId },
      relations: { user: true },
      select: { user: { id: true } },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  async findById(proId: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: proId },
      relations: { user: true },
      select: {
        user: { id: true, username: true },
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
      relations: { user: true },
      select: {
        user: { id: true, username: true },
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

  ////////////////

  async getAll(query: FilterPropertyDto) {
    const { word, minPrice, maxPrice, status } = query;
    const filters: FindOptionsWhere<Property>[] = [];
    const cacheData = await this.cacheManager.get(
      `properties${word}${minPrice}${maxPrice}${status}`,
    );
    if (cacheData) {
      console.log('Cache data'); //
      return cacheData;
    }
    // شرط البحث
    if (word) {
      const cacheData = await this.cacheManager.get('properties');
      if (cacheData) {
        console.log('Cache data'); //
        return cacheData;
      }
      filters.push({ title: Like(`%${word}%`) });
      filters.push({ description: Like(`%${word}%`) });
    }
    if ('status' in query) {
      filters.push({ status: status });
    }

    // شروط السعر
    const priceConditions = { price: this.rangeConditions(minPrice, maxPrice) };

    const where =
      filters.length > 0
        ? filters.map((filter) => ({ ...filter, ...priceConditions }))
        : { ...priceConditions };
    //

    /*    const where =
          filters.length > 0
            ? filters.map((filter) => ({ ...filter, ...priceConditions }))
            : { ...priceConditions, ...yearConditions };*/
    const properties: Property[] = await this.propertyRepository.find({
      where,
      relations: { user: true, favorites: true },
      select: {
        favorites: { id: true },
        id: true,
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

        user: { username: true },
      },
    });
    if (!properties || properties.length === 0) {
      throw new NotFoundException('No estates found');
    }

    await this.cacheManager.set(
      `properties${word}${minPrice}${maxPrice}${status}`,
      properties,
    );
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
}
