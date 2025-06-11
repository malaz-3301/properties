import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
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

//forwardRef(() كسر دائرة الاعتماد
@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private voteRepository: Repository<Vote>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @Inject(forwardRef(() => PropertiesGetProvider))
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly propertiesVoViProvider: PropertiesVoViProvider,
    private readonly usersVoViProvider: UsersVoViProvider,
  ) {}

  async changeVoteStatus(proId: number, value: number, userId: number) {
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

    if (vote) {
      //Remove
      if (vote.value === value) {
        //موجود وحط نفس القيمة (شاله)
        await this.changeVoteValues(proId, value, ownerId);
        return this.voteRepository.delete(vote.id);
      }
      //Update
      await this.changeVoteValues(proId, 2 * value, ownerId);
      return this.voteRepository.update(vote.id, { value: value });
    }
    //حالة Create
    else {
      await this.changeVoteValues(proId, value, ownerId);
      return await this.voteRepository.save({
        property: { id: proId },
        user: { id: userId },
        value: value,
      });
    }
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

  //انتبه ownerId
  async changeVoteValues(proId: number, value: number, ownerId: number) {
    await this.usersVoViProvider.incrementTotalVotes(ownerId, value);
    await this.priorityScore(proId, value);
    return await this.propertiesVoViProvider.incrementVote(proId, value);
  }

  //نقاط الظهور %30
  async priorityScore(proId: number, value: number) {
    return this.propertyRepository.increment(
      { id: proId },
      'priorityScore',
      value * 3,
    );
  }

  async isVote(proId: number, userId: number) {
    const isVote = await this.voteRepository.findOne({
      where: {
        property: { id: proId },
        user: { id: userId },
      },
    });
    return Boolean(isVote);
  }
}
