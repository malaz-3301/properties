import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { UsersGetProvider } from '../users/providers/users-get.provider';
import { PropertiesGetProvider } from '../properties/providers/properties-get.provider';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';
import { PropertiesVoViProvider } from '../properties/providers/properties-vo-vi.provider';
import { UsersVoViProvider } from '../users/providers/users-vo-vi.provider';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private voteRepository: Repository<Vote>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly usersGetProvider: UsersGetProvider,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly propertiesVoViProvider: PropertiesVoViProvider,
    private readonly usersVoViProvider: UsersVoViProvider,
  ) {}

  async create(proId: number, value: number, userId: number) {
    //
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Invalid vote value, it must be 1 or -1');
    }
    //تحقق من وجود العقار و جيب صاحبه
    const property = await this.propertiesGetProvider.getUserIdByProId(proId);
    const ownerId = property.user.id;

    const vote = await this.voteRepository.findOne({
      where: { property: { id: proId }, user: { id: userId } },
    });
    //موجود الصوت حدثه
    if (vote) {
      if (vote.value === value) {
        throw new BadRequestException('Your Vote already exists!');
      }
      await this.propertiesVoViProvider.incrementVote(proId, 2 * value);
      await this.priorityScore(proId, 2 * value);
      await this.usersVoViProvider.incrementTotalVotes(ownerId, 2 * value);

      return this.voteRepository.update(vote.id, { value: value });
    }
    await this.voteRepository.save({
      property: { id: proId },
      user: { id: userId },
      value: value,
    });
    await this.usersVoViProvider.incrementTotalVotes(ownerId, value);
    await this.priorityScore(proId, value);
    return await this.propertiesVoViProvider.incrementVote(proId, value);
  }

  async remove(proId: number, userId: number) {
    const vote = await this.voteRepository.findOneBy({
      property: { id: proId },
      user: { id: userId },
    });
    if (!vote) {
      throw new BadRequestException("You didn't vote");
    }
    await this.voteRepository.delete(vote.id);
    return this.propertyRepository.increment(
      { id: proId },
      'voteScore',
      vote.value,
    );
  }

  //if not found 0
  getUsersVotedUp(proId: number) {
    return this.voteRepository.find({
      where: { property: { id: proId }, value: 1 },
      relations: { user: true },
      select: {
        user: {
          username: true,
          profileImage: true,
        },
      },
    });
  }

  getUserVotesC(userId: number) {
    return this.voteRepository.count({
      where: { user: { id: userId } },
    });
  }

  async getUsersSpam() {
    const votes = await this.voteRepository.find({
      relations: { user: true },
      select: {
        user: {
          id: true,
          username: true,
        },
        createdAt: true,
      },
    });
    const counts: Record<string, number> = {};
    const userMap: Record<number, string> = {};
    for (const vote of votes) {
      const day = vote.createdAt.toISOString().slice(2, 10); // '2025-05-11'
      console.log(day);
      const key = `${vote.user.id}-${day}`;
      userMap[vote.user.id] = vote.user.username;
      counts[key] = ++counts[key] || 0;
    }

    const spammers = new Set<number>();
    //مصفوفة زوج
    for (const [key, cnt] of Object.entries(counts)) {
      if (cnt > 20) {
        const userId = Number(key.split('-')[0]);
        spammers.add(userId);
      }
    }
    //json
    return Array.from(spammers).map((id) => ({
      id: id,
      username: userMap[id],
    }));
  }

  async priorityScore(proId: number, value: number) {
    if (value === 1) {
      await this.propertyRepository.increment(
        { id: proId },
        'priorityScore',
        value * 3,
      );
    } else {
      await this.propertyRepository.increment(
        { id: proId },
        'priorityScore', //الرقم هام
        value * 2,
      );
    }
  }
}
