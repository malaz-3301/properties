import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBannedDto } from './dto/create-banned.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Banned } from './entities/banned.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BannedService {
  constructor(
    @InjectRepository(Banned)
    private readonly bannedRepository: Repository<Banned>,
  ) {}

  create(createBannedDto: CreateBannedDto) {
    //مدة صلاحية + الوقت الحالي
    let durationMs: number;
    const [numStr, unit] = createBannedDto.banDuration.split('_') ?? [];
    switch (unit) {
      case 'day':
        durationMs = parseInt(numStr) * 24 * 60 * 60 * 1000;
        break;
      case 'week':
        durationMs = parseInt(numStr) * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        durationMs = parseInt(numStr) * 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        durationMs = parseInt(numStr) * 12 * 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
    return this.bannedRepository.save({
      banExpiresAt: new Date(Date.now() + durationMs),
    });
  }

  async checkBlock(userId: number) {
    const block = await this.bannedRepository.findOneBy({
      user_id: userId,
    });
    if (block) {
      console.log('block');
      if (block.banExpiresAt! < new Date()) {
        await this.bannedRepository.delete(userId);
      } else {
        throw new UnauthorizedException('You was Banned!');
      }
    }
  }

  findAll() {
    return this.bannedRepository.find();
  }

  async remove(id: number) {
    const banned = await this.bannedRepository.findOne({
      where: { user_id: id },
    });
    if (banned) {
      return this.bannedRepository.remove(banned);
    }
  }
}
