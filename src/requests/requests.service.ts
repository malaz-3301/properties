import { HttpException, Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { ContractsService } from 'src/contracts/contracts.service';
import { CreateContractDto } from 'src/contracts/dto/create-contract.dto';
import { Property } from 'src/properties/entities/property.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersUpdateProvider } from 'src/users/providers/users-update.provider';
import { PropertiesUpdateProvider } from 'src/properties/providers/properties-update.provider';
import { PropertyStatus } from 'src/utils/enums';
import { UpdatePropertyDto } from 'src/properties/dto/update-property.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly contractService: ContractsService,
    private readonly notificationService: NotificationsService,
    private readonly propertiesUpdateProvider: PropertiesUpdateProvider,
  ) {}

  async create(createRequestDto: CreateRequestDto, userId: number) {
    const exists = await this.requestRepository.findOne({
      where: {
        user: { id: userId },
        property: { id: createRequestDto.propertyId },
      },
    });
    if (exists) {
      throw new HttpException('you already send Request', 400);
    }
    const newRequest = this.requestRepository.create({
      ...createRequestDto,
      property: { id: createRequestDto.propertyId },
      user: { id: userId },
    });
    return this.requestRepository.save(newRequest);
  }

  findAll(propertyId: number) {
    return this.requestRepository.find({
      where: { property: { id: propertyId } },
      relations: ['user', 'property'],
    });
  }

  findOne(id: number) {
    return this.requestRepository.findOne({
      where: { id },
      relations: ['property'],
    });
  }

  async update(id: number, updateRequestDto: UpdateRequestDto, userId: number) {
    const exists = this.requestRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!exists) {
      throw new HttpException('request not found', 400);
    }
    return this.requestRepository.update(id, {
      ...updateRequestDto,
    });
  }

  remove(id: number, userId: number) {
    const exists = this.requestRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!exists) {
      throw new HttpException('request not found', 400);
    }
    return this.requestRepository.delete(id);
  }

  async accept(id: number, userId: number) {
    const accept = await this.requestRepository.findOne({
      where: { id, property: { user: { id: userId } } },
      relations: ['user', 'property'],
    });
    if (!accept) {
      throw new HttpException('Request Not Found', 400);
    }
    const newContract = await this.contractService.create(accept.user.id, {
      propertyId: accept.property.id,
      time: accept.time,
      price: accept.time,
    });
    // console.log(accept.property);

    const notification = await this.notificationService.create(
      {
        message: 'the owner accept your request',
        propertyId: accept.property.id,
        title: 'notification',
      },
      accept.user.id,
    );
    const deleteAcceptRequest = await this.remove(accept.id, userId);

    const rejects = await this.rejectMyPropertyRequests(
      accept.property.id,
      userId,
    );

    await this.propertiesUpdateProvider.updateStatusProById(
      accept.property.id,
      PropertyStatus.HIDDEN,
    );
    return newContract;
  }

  getMyRequests(propertyId: number, userId: number) {
    return this.requestRepository.find({
      where: { property: { id: propertyId }, user: { id: userId } },
    });
  }

  async rejectMyRequests(userId: number) {
    const rejects = await this.requestRepository.find({
      where: { user: { id: userId } },
      relations: ['property'],
    });

    if (rejects.length == 0) {
      return null;
    }

    return this.requestRepository.delete(
      rejects.map((reject) => {
        return reject.id;
      }),
    );
  }

  async rejectMyPropertyRequests(propertyId: number, userId: number) {
    const rejects = await this.requestRepository.find({
      where: { property: { id: propertyId, user: { id: userId } } },
      relations: ['property', 'user'],
    });

    if (rejects.length == 0) {
      return null;
    }

    const notifications = rejects.map((reject) => {
      return this.notificationService.create(
        {
          message: 'the owner reject your request',
          propertyId: reject.property.id,
          title: 'notification',
        },
        reject.user.id,
      );
    });

    return this.requestRepository.delete(
      rejects.map((reject) => {
        return reject.id;
      }),
    );
  }

  getMyPropertyRequests(propertyId: number, userId: number) {
    return this.requestRepository.find({
      where: { property: { id: propertyId, user: { id: userId } } },
    });
  }
}
