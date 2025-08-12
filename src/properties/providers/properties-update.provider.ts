import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { PropertiesGetProvider } from './properties-get.provider';
import { Language, PropertyStatus, UserType } from 'src/utils/enums';
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
  if (!property){
    throw new NotFoundException()
  }
     if (updatePropertyDto.description){
      property.ar_description = updatePropertyDto.description
      property.en_description = await this.propertiesGetProvider.translate(Language.ENGLISH, updatePropertyDto.description)
    }
    if (updatePropertyDto.title){
      property["ar_title"] = updatePropertyDto.title
      property["en_title"] = await this.propertiesGetProvider.translate(Language.ENGLISH, updatePropertyDto.title)
    }
    const temp = {...property, ...updatePropertyDto}
    
    return this.propertyRepository.save(temp)

  }

  async updateAgencyPro(
    proId: number,
    agencyId: number,
    editProAgencyDto: EditProAgencyDto,
  ) {
    const property = await this.propertiesGetProvider.getProByUser(
      proId,
      agencyId,
      UserType.AGENCY,
    );
     if (editProAgencyDto.description){
      property["ar_description"] = editProAgencyDto.description
      property["en_description"] = await this.propertiesGetProvider.translate(Language.ENGLISH, editProAgencyDto.description)
    }
    if (editProAgencyDto.title){
      property["ar_title"] = editProAgencyDto.title
      property["en_title"] = await this.propertiesGetProvider.translate(Language.ENGLISH, editProAgencyDto.title)
    }
    const temp = {...property, ...editProAgencyDto}
    return this.propertyRepository.save(temp);
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

  async updateAdminPro(proId: number, update: any) {
    const property = await this.propertiesGetProvider.findById(proId);
     if (update.description){
      property["ar_description"] = update.description
      property["en_description"] = await this.propertiesGetProvider.translate(Language.ENGLISH, update.description)
    }
    if (update.title){
      property["ar_title"] = update.title
      property["en_title"] = await this.propertiesGetProvider.translate(Language.ENGLISH, update.title)
    }
    const temp = {...property, ...update}
    return this.propertyRepository.save(temp);
  }

  async markCommissionPaid(proId: number) {
    return this.propertyRepository.update(proId, {
      commissionPaid: true,
    });
  }
}
