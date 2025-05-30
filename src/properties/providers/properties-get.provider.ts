import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { PropertyStatus } from '../../utils/enums';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class PropertiesGetProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async findById(id: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: id },
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

  ////////////////

  async getAll(
    word?: string,
    minPrice?: string,
    maxPrice?: string,
    state?: PropertyStatus,
  ) {
    const filters: FindOptionsWhere<Property>[] = [];
    const cacheData = await this.cacheManager.get(
      `properties${word}${minPrice}${maxPrice}${state}`,
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
        state: true,
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
      `properties${word}${minPrice}${maxPrice}${state}`,
      properties,
    );
    return properties;
  }
}
