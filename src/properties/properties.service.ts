import {
  Injectable,
  NotFoundException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { UsersOtpProvider } from '../users/providers/users-otp.provider';
import { GeolocationService } from '../geolocation/geolocation.service';
import { PropertiesImgProvider } from './providers/properties-img.provider';
import * as bcrypt from 'bcryptjs';
import { PropertiesDelProvider } from './providers/properties-del.provider';
import { PropertiesGetProvider } from './providers/properties-get.provider';

import { PropertyStatus, UserType } from '../utils/enums';
import { PropertiesUpdateProvider } from './providers/properties-update.provider';
import { UsersGetProvider } from '../users/providers/users-get.provider';
import { ideal, weights } from '../utils/constants';
import { UpdateProAdminDto } from './dto/update-pro-admin.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { RejectProAdminDto } from './dto/reject-pro-admin.dto';
import { AgenciesVoViProvider } from '../users/providers/agencies-vo-vi.provider';
import { AcceptProAdminDto } from './dto/accept-pro-admin.dto';
import { EditProAgencyDto } from './dto/edit-pro-agency.dto';
import { PriorityRatio } from './entities/priority-ratio.entity';
import { PropertiesVoSuViProvider } from './providers/properties-vo-su-vi.provider';
import { PropertiesCreateProvider } from './providers/properties-create.provider';
import { GeoProDto } from './dto/geo-pro.dto';
import { NearProDto } from './dto/near-pro.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private dataSource: DataSource,
    private readonly propertiesVoViProvider: PropertiesVoSuViProvider,
    private readonly propertiesUpdateProvider: PropertiesUpdateProvider,
    private readonly propertiesImgProvider: PropertiesImgProvider,
    private readonly propertiesDelProvider: PropertiesDelProvider,
    private readonly propertiesGetProvider: PropertiesGetProvider,
    private readonly propertiesCreateProvider: PropertiesCreateProvider,
  ) {}

  //create from other
  create(createPropertyDto: CreatePropertyDto, ownerId: number) {
    return this.propertiesCreateProvider.create(createPropertyDto, ownerId);
  }

  updateOwnerPro(
    proId: number,
    userId: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesUpdateProvider.updateOwnerPro(
      proId,
      userId,
      updatePropertyDto,
    );
  }

  updateAdminPro(proId: number, updateProAdminDto: UpdateProAdminDto) {
    return this.propertiesUpdateProvider.updateAdminPro(
      proId,
      updateProAdminDto,
    );
  }

  updateAgencyPro(
    proId: number,
    agencyId: number,
    editProAgencyDto: EditProAgencyDto,
  ) {
    return this.propertiesUpdateProvider.updateAgencyPro(
      proId,
      agencyId,
      editProAgencyDto,
    );
  }

  acceptAgencyPro(proId: number, agencyId: number) {
    return this.propertiesUpdateProvider.acceptAgencyPro(proId, agencyId);
  }

  async rejectAgencyPro(proId: number, agencyId: number) {
    return this.propertiesUpdateProvider.rejectAgencyPro(proId, agencyId);
  }

  getAll(query: FilterPropertyDto, ownerId?: number, agencyId?: number) {
    return this.propertiesGetProvider.getAll(query, ownerId, agencyId);
  }

  getAllPendingAgency(
    query: FilterPropertyDto,
    ownerId?: number,
    agencyId?: number,
  ) {
    query.status = PropertyStatus.PENDING;
    return this.propertiesGetProvider.getAll(query, ownerId, agencyId);
  }

  async getOnePro(proId: number, userId: number) {
    return this.propertiesGetProvider.findById_ACT(proId, userId);
  }

  async getUserPro(proId: number, userId: number, role: UserType) {
    return this.propertiesGetProvider.getProByUser(proId, userId, role);
  }

  async getProByGeo(geoProDto: GeoProDto) {
    return this.propertiesGetProvider.getProByGeo(geoProDto);
  }

  async getProNearMe(nearProDto: NearProDto) {
    return this.propertiesGetProvider.getProNearMe(nearProDto);
  }

  async deleteOwnerPro(proId: number, userId: number, password: string) {
    return this.propertiesDelProvider.deleteOwnerPro(proId, userId, password);
  }

  async deleteProById(id: number) {
    return this.propertiesDelProvider.deleteProById(id);
  }

  async setSingleImg(id: number, userId: number, file: Express.Multer.File) {
    return this.propertiesImgProvider.setSingleImg(id, userId, file);
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    return this.propertiesImgProvider.setMultiImg(id, userId, filenames);
  }

  async setMultiPanorama(
    id: number,
    userId: number,
    panoramaNames: string[],
    filenames: string[],
  ) {
    return this.propertiesImgProvider.setMultiPanorama(
      id,
      userId,
      panoramaNames,
      filenames,
    );
  }

  /*  async removeSingleImage(id: number, userId: number) {
      return this.propertiesImgProvider.removeSingleImage(id, userId);
    }*/

  async removeAnyImg(id: number, userId: number, imageName: string) {
    return this.propertiesImgProvider.removeAnyImg(id, userId, imageName);
  }

  async computePropertySuitability(
    property: Property,
    manager?: EntityManager,
  ) {
    return this.propertiesVoViProvider.computeSuitabilityRatio(
      property,
      manager,
    );
  }

  getTopScorePro(limit: number) {
    return this.propertiesGetProvider.getTopScorePro(limit);
  }
}
