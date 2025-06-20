import { Injectable } from '@nestjs/common';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { PropertiesGetProvider } from './properties-get.provider';
import { PropertyStatus } from 'src/utils/enums';
import { UpdateProAdminDto } from '../dto/update-pro-admin.dto';
import { RejectProAdminDto } from '../dto/reject-pro-admin.dto';
import { UsersOtpProvider } from '../../users/providers/users-otp.provider';
import { AcceptProAdminDto } from '../dto/accept-pro-admin.dto';

@Injectable()
export class PropertiesUpdateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly usersOtpProvider: UsersOtpProvider,
  ) {}

  async updateMyPro(
    id: number,
    userId: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    await this.propertiesGetProvider.MyProperty(id, userId);
    return this.propertyRepository.update(id, updatePropertyDto);
  }

  async updateProById(id: number, updateProAdminDto: UpdateProAdminDto) {
    await this.propertiesGetProvider.findById(id);
    return this.propertyRepository.update(id, updateProAdminDto);
  }

  async acceptProById(proId: number, acceptProAdminDto: AcceptProAdminDto) {
    const property = await this.propertiesGetProvider.getUserIdByProId(proId);

    await this.propertyRepository.increment({ id: proId }, 'acceptCount', 1);
    const adminsScoreRate =
      property.priorityScoreEntity.adminsScoreRate + acceptProAdminDto.rating;

    await this.propertyRepository.update(proId, {
      priorityScoreEntity: { adminsScoreRate: adminsScoreRate },
    });
    //اذا كان اكبر من واحد معناها مقبول من ادمن
    if (property.acceptCount >= 1) {
      // حطيت 1 بدل 2 لان انا عم جيب الاوبجيكت قبل ما زيده
      const priorityScoreRate =
        property.priorityScoreRate + adminsScoreRate * 2;
      
      return this.propertyRepository.update(proId, {
        priorityScoreEntity: { adminsScoreRate: adminsScoreRate },
        priorityScoreRate: priorityScoreRate,
        status: PropertyStatus.ACCEPTED,
      });
    }
  }

  async rejectProById(proId: number, rejectProAdminDto: RejectProAdminDto) {
    const property = await this.propertiesGetProvider.getUserIdByProId(proId);
    await this.propertyRepository.update(proId, {
      status: PropertyStatus.ACCEPTED,
    });
    return this.usersOtpProvider.sendSms(
      property.user.phone,
      rejectProAdminDto.message,
    );
  }

  async updateStatusProById(id: number, status: PropertyStatus) {
    await this.propertiesGetProvider.findById(id);
    return this.propertyRepository.update(id, { status: status });
  }
}
