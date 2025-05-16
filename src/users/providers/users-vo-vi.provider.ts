import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersVoViProvider {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async incrementTotalVotes(ownerId: number, value: number) {
    await this.userRepository.increment(
      { id: ownerId },
      'totalVoteScore',
      value,
    );
  }

  async incrementTotalViews(ownerId: number) {
    await this.userRepository.increment({ id: ownerId }, 'totalViewCount', 1);
  }
}
