import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { UsersGetProvider } from 'src/users/providers/users-get.provider';

@Injectable()
export class PropertiesUpdateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private usersGetProvider: UsersGetProvider
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
    if (!property) {
      throw new NotFoundException();
    }
    if (updatePropertyDto.description) {
      property.multi_description['ar'] = updatePropertyDto.description;
      property.multi_description['en'] =
        await this.usersGetProvider.translate(
          Language.ENGLISH,
          updatePropertyDto.description,
        );
        property.multi_description['de'] =
        await this.usersGetProvider.translate(
          Language.Germany,
          updatePropertyDto.description,
        );
    }
    if (updatePropertyDto.title) {
      property.multi_title['ar'] = updatePropertyDto.title;
      property.multi_title['en'] = await this.usersGetProvider.translate(
        Language.ENGLISH,
        updatePropertyDto.title,
      );
      property.multi_title['de'] = await this.usersGetProvider.translate(
        Language.Germany,
        updatePropertyDto.title,
      );
    }

    return this.propertyRepository.save({...property, ...updatePropertyDto});
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
    if (editProAgencyDto.description) {
      property.multi_description['ar'] = editProAgencyDto.description;
      property.multi_description['en'] =
        await this.usersGetProvider.translate(
          Language.ENGLISH,
          editProAgencyDto.description,
        );
        property.multi_description['de'] =
        await this.usersGetProvider.translate(
          Language.Germany,
          editProAgencyDto.description,
        );
    }
    if (editProAgencyDto.title) {
      property.multi_title['ar'] = editProAgencyDto.title;
      property.multi_title['en'] = await this.usersGetProvider.translate(
        Language.ENGLISH,
        editProAgencyDto.title,
      );
      property.multi_title['de'] = await this.usersGetProvider.translate(
        Language.Germany,
        editProAgencyDto.title,
      );
    }
    return this.propertyRepository.save({...property, ...editProAgencyDto});
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
    if (update.description) {
      property.multi_description['ar'] = update.description;
      property.multi_description['en'] =
        await this.usersGetProvider.translate(
          Language.ENGLISH,
          update.description,
        );
        property.multi_description['de'] =
        await this.usersGetProvider.translate(
          Language.Germany,
          update.description,
        );
    }
    if (update.title) {
      property.multi_title['ar'] = update.title;
      property.multi_title['en'] = await this.usersGetProvider.translate(
        Language.ENGLISH,
        update.title,
      );
      property.multi_title['de'] = await this.usersGetProvider.translate(
        Language.Germany,
        update.title,
      );
    }
    return this.propertyRepository.save({...property, ...update});
  }

  async markCommissionPaid(proId: number) {
    return this.propertyRepository.update(proId, {
      commissionPaid: true,
    });
  }
}
