import { Injectable } from '@nestjs/common';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { PropertiesGetProvider } from './properties-get.provider';

@Injectable()
export class PropertiesUpdateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  async updateMyPro(
    id: number,
    userId: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    await this.propertiesGetProvider.MyProperty(id, userId);
    return this.propertyRepository.save(updatePropertyDto);
  }

  async updateProById(id: number, updatePropertyDto: UpdatePropertyDto) {
    await this.propertiesGetProvider.findById(id);
    return this.propertyRepository.save(updatePropertyDto);
  }
}
