import { Injectable, Logger } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Between, FindOperator, LessThan, MoreThan, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly userService: UsersService,
  ) {}

  create(userId: number, createContractDto: CreateContractDto) {
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + createContractDto.time);
    console.log(validUntil);

    const newContract = this.contractRepository.create({
      ...createContractDto,
      user: { id: userId },
      expireIn: validUntil,
      property: { id: createContractDto.propertyId },
    });
    return this.contractRepository.save(newContract);
  }

  findAll() {
    return this.contractRepository.find();
  }

  findOne(id: number) {
    return this.contractRepository.findOne({ where: { id } });
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    if (updateContractDto.time) {
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + updateContractDto.time);
      return this.contractRepository.update(id, {
        ...updateContractDto,
        expireIn: validUntil,
      });
    }
  }

  remove(id: number) {
    return this.contractRepository.delete(id);
  }

  async getMyActiveContracts(userId: number) {
    const contracts = await this.contractRepository.find({
      where: {
        user: { id: userId },

        expireIn: MoreThan(new Date()),
      },
    });
    return contracts;
  }

  async getMyExpiredContracts(userId: number) {
    const contracts = await this.contractRepository.find({
      where: {
        user: { id: userId },
        expireIn: LessThan(new Date()),
      },
    });
    return contracts;
  }

  async getMyContracts(userId: number) {
    const active = this.getMyActiveContracts(userId);
    const expired = this.getMyExpiredContracts(userId);
    return { active: active, expired: expired };
  }

  expiredAfterWeek() {
    const today = new Date();
    const afterWeek = new Date();
    today.setDate(today.getDate() + 7);
    return this.contractRepository.find({
      where: {
        expireIn: Between(today, afterWeek),
      },
      relations: ['property'],
    });
  }

  MyContractsExpiredAfterWeek(userId: number) {
    const today = new Date();
    const afterWeek = new Date();
    today.setDate(today.getDate() + 7);
    return this.contractRepository.find({
      where: {
        expireIn: Between(today, afterWeek),
        user: { id: userId },
      },
      relations: ['property'],
    });
  }
}
