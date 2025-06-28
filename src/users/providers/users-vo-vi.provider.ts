import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Statistics } from '../entities/statistics.entity';
import { newMangleNameCache } from '@swc/core/binding';

//increment depends on value
@Injectable()
export class UsersVoViProvider {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Statistics)
    private readonly statsRepository: Repository<Statistics>,
  ) {}

  async incrementTotalVotes(ownerId: number, value: number) {
    await this.statsRepository.increment(
      { user_id: ownerId },
      'totalVoteScore',
      value,
    );
  }

  //PropertyCount
  async incrementTotalProperties(
    ownerId: number,
    value: number,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(Statistics)
      : this.statsRepository;

    await repository.increment(
      { user_id: ownerId },
      'totalPropertyCount',
      value,
    );
  }

  async incrementTotalViews(ownerId: number) {
    await this.statsRepository.increment(
      { user_id: ownerId },
      'totalViewCount',
      1,
    );
  }
}
