import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PropertiesGetProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async getAll() {
    return 'ok';
  }

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
      relations: { estate: true, vehicle: true },
      select: {
        user: { username: true },
      },
    });
  }
}
