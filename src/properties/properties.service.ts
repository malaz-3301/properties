import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';

@Injectable()
export class PropertiesService {
  getAll() {
    /*  return this.propertyRepository.find();*/
  }

  async getById(id: number) {
    /*    const property = await this.propertyRepository.findOneBy({ id: id });
        if (!property) {
          throw new NotFoundException('User Not Found');
        }
        return property;*/
  }

  delete(id: number) {
    /* return this.propertyRepository.delete({ id: id });*/
  }
}
