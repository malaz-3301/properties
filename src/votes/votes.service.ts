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
import { PropertiesVoSuViProvider } from '../properties/providers/properties-vo-su-vi.provider';
import { AgenciesVoViProvider } from '../users/providers/agencies-vo-vi.provider';
import { PriorityRatio } from '../properties/entities/priority-ratio.entity';
import { VotesGetProvider } from './providers/votes-get.provider';

//forwardRef(() كسر دائرة الاعتماد
@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private voteRepository: Repository<Vote>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @Inject(forwardRef(() => PropertiesGetProvider))
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly propertiesVoViProvider: PropertiesVoSuViProvider,
    private readonly agenciesVoViProvider: AgenciesVoViProvider,
    private readonly votesGetProvider: VotesGetProvider,
  ) {}

  async changeVoteStatus(proId: number, value: number, userId: number) {
    //
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Invalid vote value, it must be 1 or -1');
    }
    //تحقق من وجود العقار و جيب صاحبه
    const property = await this.propertiesGetProvider.getUserIdByProId(proId);
    const agencyId = property.agency.id;

    const vote = await this.voteRepository.findOne({
      where: { property: { id: proId }, user: { id: userId } },
    });

    if (vote) {
      //Remove
      if (vote.value === value) {
        //موجود وحط نفس القيمة (شاله)
        await this.changeAllVotes(proId, -value, agencyId);
        return this.voteRepository.delete(vote.id);
      } else {
        //Update
        await this.changeAllVotes(proId, -2 * value, agencyId);
        return this.voteRepository.update(vote.id, { value: value });
      }
    }
    //حالة Create
    else {
      await this.changeAllVotes(proId, value, agencyId);
      return await this.voteRepository.save({
        property: { id: proId },
        user: { id: userId },
        value: value,
      });
    }
  }

  //انتبه ownerId
  async changeAllVotes(proId: number, value: number, agencyId: number) {
    await this.agenciesVoViProvider.changeVotesNum(agencyId, value); //agency
    await this.propertiesVoViProvider.changeVotesNum(proId, value); //property
    return await this.changePrimacy(proId, value);
  }

  //نقاط الظهور %50
  async changePrimacy(proId: number, value: number) {
    const property = await this.propertiesGetProvider.findById(proId);
    const safeScore = Math.max(property.voteScore + value, 0); // يمنع السالب
    const k = 10;
    //عامل تأخير للنمو

    const weight = Math.log10(safeScore + k) * (50 / Math.log10(1000 + 1));
    const newMax = Math.min(weight, 50);
    console.log('newMax', newMax);
    //شيل القديمة وحط الجديدة
    const oldMax = property.priorityRatio.voteRatio;

    const primacy = property.primacy - oldMax + newMax;
    return await this.propertyRepository.update(proId, {
      priorityRatio: { voteRatio: newMax },
      primacy: primacy,
    });
  }

  async getVoteSpammers() {
    return this.votesGetProvider.getVoteSpammers();
  }

  //if not found 0
  getUsersVotedUp(proId: number) {
    return this.votesGetProvider.getUsersVotedUp(proId);
  }

  //للتحقق من my_act
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
