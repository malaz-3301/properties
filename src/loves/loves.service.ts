import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLoveDto } from './dto/create-love.dto';
import { UpdateLoveDto } from './dto/update-love.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Love } from './entities/love.entity';
import { Between, Repository } from 'typeorm';
import { UsersGetProvider } from '../users/providers/users-get.provider';
import { PropertiesGetProvider } from '../properties/providers/properties-get.provider';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class LovesService {
  constructor(
    @InjectRepository(Love) private loveRepository: Repository<Love>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly usersGetProvider: UsersGetProvider,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  async create(proId: number, userId: number) {
    const loveIt = await this.loveRepository.findOneBy({
      property: { id: proId },
      user: { id: userId },
    });
    if (loveIt) {
      throw new BadRequestException('You loved it !');
    }
    //create
    const user = await this.usersGetProvider.findById(userId);
    const property = await this.propertiesGetProvider.findById(proId);
    const love = this.loveRepository.create({
      property: property,
      user: user,
    });
    await this.loveRepository.save(love);
    return this.propertyRepository.increment({ id: proId }, 'loveCount', 1);
  }

  async remove(proId: number, userId: number) {
    const love = await this.loveRepository.findOneBy({
      property: { id: proId },
      user: { id: userId },
    });
    if (!love) {
      throw new BadRequestException('Not Found');
    }
    await this.loveRepository.delete(love.id);
    return this.propertyRepository.decrement({ id: proId }, 'loveCount', 1);
  }

  //if not found 0
  getUserLovesOnPro(proId: number) {
    return this.loveRepository.find({
      where: { property: { id: proId } },
      relations: { user: true },
      select: {
        user: {
          username: true,
          profileImage: true,
        },
      },
    });
  }

  async getUserProsLovesC(userId: number) {
    const loveCounts = await this.propertyRepository.find({
      where: { user: { id: userId } },
      select: {
        loveCount: true,
      },
    });
    return loveCounts.reduce((sum, prop) => sum + (prop.loveCount || 0), 0);
  }

  getUserLovesC(userId: number) {
    return this.loveRepository.count({
      where: { user: { id: userId } },
    });
  }

  async getUsersSpam() {
    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const day = new Date(new Date().setHours(23, 59, 59, 999));
    const loves = await this.loveRepository.find({
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
    for (const love of loves) {
      const day = love.createdAt.toISOString().slice(2, 10); // '2025-05-11'
      console.log(day);
      const key = `${love.user.id}-${day}`;
      userMap[love.user.id] = love.user.username;
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
