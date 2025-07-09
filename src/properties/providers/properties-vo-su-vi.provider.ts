import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ideal, weights } from '../../utils/constants';
import { PriorityRatio } from '../entities/priority-ratio.entity';

@Injectable()
export class PropertiesVoSuViProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PriorityRatio)
    private priorityRatioRepository: Repository<PriorityRatio>,
  ) {}

  //VotesModule
  async changeVotesNum(proId: number, value: number) {
    await this.propertyRepository.increment({ id: proId }, 'voteScore', value);
  }

  //ViewsModule
  async changeViewsNum(proId: number) {
    await this.propertyRepository.increment({ id: proId }, 'viewCount', 1);
  }

  async computeSuitabilityRatio(property: Property, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Property)
      : this.propertyRepository;

    const [minPricePro] = await repository.find({
      order: {
        price: 'ASC',
      },
      select: { price: true },
      take: 1,
    });
    const [maxPricePro] = await repository.find({
      order: {
        price: 'DESC',
      },
      select: { price: true },
      take: 1,
    });
    const minPrice = minPricePro?.price ?? 0;
    const maxPrice = maxPricePro?.price ?? 0;
    const sub = maxPrice - minPrice || 1;
    let score = 0;

    score += weights.rooms * Math.min(property.rooms / ideal.rooms, 1);
    score +=
      weights.bathrooms * Math.min(property.bathrooms / ideal.bathrooms, 1);
    score += weights.area * Math.min(property.area / ideal.area, 1);
    score += weights.garden * (property.hasGarden ? 1 : 0);
    score += weights.garage * (property.hasGarage ? 1 : 0);

    // Min-Max Normalization
    let priceScore = 1 - (property.price - minPrice) / sub;
    priceScore = Math.max(0, Math.min(1, priceScore));
    score += weights.price * priceScore;
    // ideal score = 100
    //عمل النسبة من 50 , و تخزينها
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeee');
    property.priorityRatio = this.priorityRatioRepository.create();
    property.priorityRatio.suitabilityRatio = score / 2;
    console.log('fffffffffffffffffffffffffffffff');
    property.primacy += score / 2;
    console.log('compute');

    return await repository.save(property);
  }
}
