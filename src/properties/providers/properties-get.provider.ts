import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PropertyStatus } from '../../utils/enums';

@Injectable()
export class PropertiesGetProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
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

    // شرط البحث
    if (word) {
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
      relations: { user: true },
      select: {
        id: true,
        bathrooms: true,
        area: true,
        price: true,
        propertyImages: true,
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

    return properties.map((p) => ({
      ...p,
      propertyImages: null,
      firstImage:
        p.propertyImages?.[0] ??
        'https://cdn-icons-png.flaticon.com/512/4757/4757668.png',
    }));
  }
}
