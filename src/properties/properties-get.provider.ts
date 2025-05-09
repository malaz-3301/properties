import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PropertyStatus } from '../utils/enums';

@Injectable()
export class PropertiesGetProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async getByPropId(id: number) {
    return await this.findById(id);
  }

  async getByUserId(userId: number) {
    return this.propertyRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findById(id: number) {
    const property = await this.propertyRepository.findOne({
      where: { id: id },
      relations: { user: true },
      select: {
        user: { username: true },
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
        location: {
          country: true,
          governorate: true,
          city: true,
          quarter: true,
          street: true,
        },
        user: { username: true },
      },
    });
    if (!properties || properties.length === 0) {
      throw new NotFoundException('No estates found');
    }
    return properties;
  }
}
