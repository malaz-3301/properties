import { Injectable } from '@nestjs/common';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { View } from './entities/view.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { PropertiesGetProvider } from '../properties/providers/properties-get.provider';
import { PropertiesVoSuViProvider } from '../properties/providers/properties-vo-su-vi.provider';
import { AgenciesVoViProvider } from '../users/providers/agencies-vo-vi.provider';

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(View)
    private readonly viewRepository: Repository<View>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly propertiesVoViProvider: PropertiesVoSuViProvider,
    private readonly agenciesVoViProvider: AgenciesVoViProvider,
  ) {}

  async create(proId: number, agencyId: number) {
    const view = await this.viewRepository.findOne({
      where: { property: { id: proId }, user: { id: agencyId } },
    });
    if (!view) {
      //تحقق من وجود العقار و جيب صاحبه
      const property = await this.propertiesGetProvider.getUserIdByProId(proId);
      const agencyId = property.agency.id;
      // if (ownerId === userId) return; make it
      await this.viewRepository.save({
        property: { id: proId },
        user: { id: agencyId },
      });
      await this.agenciesVoViProvider.incrementTotalViews(agencyId);
      return await this.propertiesVoViProvider.changeViewsNum(proId);
    }
  }
}
