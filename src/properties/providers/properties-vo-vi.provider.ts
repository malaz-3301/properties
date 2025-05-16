import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PropertiesVoViProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  //VotesModule
  async incrementVote(proId: number, value: number) {
    await this.propertyRepository.increment({ id: proId }, 'voteScore', value);
  }

  //ViewsModule
  async incrementView(proId: number) {
    await this.propertyRepository.increment({ id: proId }, 'viewCount', 1);
  }
}
