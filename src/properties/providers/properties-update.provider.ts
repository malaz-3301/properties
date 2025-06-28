import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { PropertiesGetProvider } from './properties-get.provider';
import { PropertyStatus, UserType } from 'src/utils/enums';
import { UpdateProAdminDto } from '../dto/update-pro-admin.dto';
import { RejectProAdminDto } from '../dto/reject-pro-admin.dto';
import { UsersOtpProvider } from '../../users/providers/users-otp.provider';
import { AcceptProAdminDto } from '../dto/accept-pro-admin.dto';
import { EditProAgencyDto } from '../dto/edit-pro-agency.dto';

@Injectable()
export class PropertiesUpdateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly usersOtpProvider: UsersOtpProvider,
  ) {}

  async updateOwnerPro(
    proId: number,
    ownerId: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    const property = await this.propertiesGetProvider.getProByUser(
      proId,
      ownerId,
      UserType.Owner,
    );
    if (property?.status === PropertyStatus.ACCEPTED) {
      throw new UnauthorizedException(
        "You can't update the property has been published",
      );
    }
    return this.propertyRepository.update(proId, updatePropertyDto);
  }

  async updateAgencyPro(
    proId: number,
    agencyId: number,
    editProAgencyDto: EditProAgencyDto,
  ) {
    await this.propertiesGetProvider.getProByUser(
      proId,
      agencyId,
      UserType.AGENCY,
    );
    return this.propertyRepository.update(proId, editProAgencyDto);
  }

  async acceptAgencyPro(proId: number, agencyId: number) {
    await this.propertiesGetProvider.getProByUser(
      proId,
      agencyId,
      UserType.AGENCY,
    );
    return this.propertyRepository.update(proId, {
      status: PropertyStatus.ACCEPTED,
    });
  }

  async rejectAgencyPro(proId: number, agencyId: number) {
    await this.propertiesGetProvider.getProByUser(
      proId,
      agencyId,
      UserType.AGENCY,
    );
    await this.propertyRepository.update(proId, {
      status: PropertyStatus.ACCEPTED,
    });
    /*    return this.usersOtpProvider.sendSms(
          property.owner.phone,
          rejectProAdminDto.message,
        );*/
  }

  async updateAdminPro(proId: number, updateProAdminDto: UpdateProAdminDto) {
    await this.propertiesGetProvider.findById(proId);
    return this.propertyRepository.update(proId, updateProAdminDto);
  }

  /*
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
        property.owner.phone,
        rejectProAdminDto.message,
      );
    }
  
  */
}
