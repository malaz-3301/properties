import { Injectable } from '@nestjs/common';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { View } from './entities/view.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { PropertiesGetProvider } from '../properties/providers/properties-get.provider';
import { PropertiesVoViProvider } from '../properties/providers/properties-vo-vi.provider';
import { UsersVoViProvider } from '../users/providers/users-vo-vi.provider';

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(View)
    private readonly viewRepository: Repository<View>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly propertiesVoViProvider: PropertiesVoViProvider,
    private readonly usersVoViProvider: UsersVoViProvider,
  ) {}

  async create(proId: number, userId: number) {
    const view = await this.viewRepository.findOne({
      where: { property: { id: proId }, user: { id: userId } },
    });
    if (!view) {
      //تحقق من وجود العقار و جيب صاحبه
      const property = await this.propertiesGetProvider.getUserIdByProId(proId);
      const ownerId = property.user.id;
      // if (ownerId === userId) return; make it
      await this.viewRepository.save({
        property: { id: proId },
        user: { id: userId },
      });
      await this.usersVoViProvider.incrementTotalViews(ownerId);
      return await this.propertiesVoViProvider.incrementView(proId);
    }
  }

  findAll() {
    return `This action returns all view`;
  }
}
