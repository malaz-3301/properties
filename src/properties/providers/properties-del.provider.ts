import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { PropertiesService } from '../properties.service';
import { PropertiesGetProvider } from './properties-get.provider';

@Injectable()
export class PropertiesDelProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  async deleteMyPro(id: number, userId: number, password: string) {
    const property = await this.propertyRepository.findOne({
      //if it is mine && get password
      where: { id: id, user: { id: userId } },
      relations: { user: true },
      select: { user: { password: true } },
    });
    if (!property) {
      throw new NotFoundException('Removed by Admin Or it is not yours');
    }
    const isPass = await bcrypt.compare(password, property.user.password);
    if (!isPass) {
      throw new UnauthorizedException('Password is incorrect');
    }
    return this.propertyRepository.delete({ id: id });
  }

  async deleteProById(id: number) {
    const property = this.propertiesGetProvider.findById(id);
    return this.propertyRepository.delete({ id: id });
  }
}
