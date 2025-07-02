import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from '../entities/vote.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VotesGetProvider {
  constructor(
    @InjectRepository(Vote) private voteRepository: Repository<Vote>,
  ) {}

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

  async getVoteSpammers() {
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
}
