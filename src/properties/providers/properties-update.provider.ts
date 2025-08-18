import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { PropertiesGetProvider } from './properties-get.provider';
import { Language, PropertyStatus, UserType } from '../../utils/enums';
import { EditProAgencyDto } from '../dto/edit-pro-agency.dto';
import { UsersGetProvider } from '../../users/providers/users-get.provider';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';
import { CreatePropertyDto } from '../dto/create-property.dto';

@Injectable()
export class PropertiesUpdateProvider {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private usersGetProvider: UsersGetProvider,
    @Inject('SMS_SERVICE') private readonly client2: ClientProxy,
    private i18n: I18nService,
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
    await this.updateTranslatedProperty(property, updatePropertyDto);
    return this.propertyRepository.save({ ...property, ...updatePropertyDto });
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
    await this.updateTranslatedProperty(property, editProAgencyDto);
    return this.propertyRepository.save({ ...property, ...editProAgencyDto });
  }

  async acceptAgencyPro(proId: number, agencyId: number) {
    const property = await this.propertiesGetProvider.getProByUser(
      proId,
      agencyId,
      UserType.AGENCY,
    );

    const updatedProperty = await this.propertyRepository.update(proId, {
      status: PropertyStatus.ACCEPTED,
    });
    const user = await this.usersGetProvider.findById(property.owner.id);
    const accept = await this.i18n.t('transolation.AcceptMessage', {
      lang: user.language,
    });
    console.log(accept);
    this.client2.emit(
      'create_user.sms',
      new RmqRecordBuilder({
        phone: user.phone,
        message: `${accept}`,
      })
        .setOptions({ persistent: true })
        .build(),
    );
    return updatedProperty;
  }

  async rejectAgencyPro(proId: number, agencyId: number) {
    const property = await this.propertiesGetProvider.getProByUser(
      proId,
      agencyId,
      UserType.AGENCY,
    );
    const updatedProperty = await this.propertyRepository.update(proId, {
      status: PropertyStatus.Rejected,
    });
    const user = await this.usersGetProvider.findById(property.owner.id);
    const reject = await this.i18n.t('transolation.RejectMessage', {
      lang: user.language,
    });
    console.log(reject);
    this.client2.emit(
      'create_user.sms',
      new RmqRecordBuilder({
        phone: user.phone,
        message: `${reject}`,
      })
        .setOptions({ persistent: true })
        .build(),
    );
    return updatedProperty;

    /*    return this.usersOtpProvider.sendSms(
          property.owner.phone,
          rejectProAdminDto.message,
        );*/
  }

  async updateAdminPro(proId: number, update: any) {
    const property = await this.propertiesGetProvider.findById(proId);
    await this.updateTranslatedProperty(property, update);
    return this.propertyRepository.save({ ...property, ...update });
  }

  async markCommissionPaid(proId: number) {
    return this.propertyRepository.update(proId, {
      commissionPaid: true,
    });
  }
  async updateTranslatedProperty(
    property: Property,
    updatePropertyDto: UpdatePropertyDto | EditProAgencyDto,
  ) {
    if (updatePropertyDto.description) {
      property.multi_description = { ar: updatePropertyDto.description };
      property.multi_description['en'] = await this.usersGetProvider.translate(
        Language.ENGLISH,
        updatePropertyDto.description,
      );
      property.multi_description['de'] = await this.usersGetProvider.translate(
        Language.Germany,
        updatePropertyDto.description,
      );
    }
    if (updatePropertyDto.title) {
      property.multi_title = { ar: updatePropertyDto.title };
      property.multi_title['en'] = await this.usersGetProvider.translate(
        Language.ENGLISH,
        updatePropertyDto.title,
      );
      property.multi_title['de'] = await this.usersGetProvider.translate(
        Language.Germany,
        updatePropertyDto.title,
      );
    }
  }
}
