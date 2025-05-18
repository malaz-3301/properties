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

  create(createContractDto: CreateContractDto) {
    const newContract = this.contractRepository.create(createContractDto);
    return this.contractRepository.save(newContract);
  }

  findAll() {
    return this.contractRepository.find();
  }

  findOne(id: number) {
    return this.contractRepository.findOne({ where: { id } });
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    return this.contractRepository.update(id, updateContractDto);
  }

  remove(id: number) {
    return this.contractRepository.delete(id);
  }

  async getMyActiveContracts(userId: number) {
    const contracts = await this.contractRepository.find({
      where: {
        user: {id : userId},

        validUntil : MoreThan(new Date())}
    });
    return contracts;
  }

  async getMyExpiredContracts(userId: number) {
    const contracts = await this.contractRepository.find({
      where: {
        user: {id : userId},
        validUntil : LessThan(new Date())
      },
    });
    return contracts
  }

  async getMyContracts(userId: number) {
    const active = this.getMyActiveContracts(userId);
    const expired = this.getMyExpiredContracts(userId);
    return {active : active, expired : expired};
  }

  expiredAfterWeek() {
    const today = new Date();
    const afterWeek = new Date();
    today.setDate(today.getDate() + 7);
    return this.contractRepository.find({
      where: {
        validUntil: Between(today, afterWeek),
      },
      relations: ['property'],
    });
  }

  MyContractsExpiredAfterWeek(userId : number) {
    const today = new Date();
    const afterWeek = new Date();
    today.setDate(today.getDate() + 7);
    return this.contractRepository.find({
      where: {
        validUntil: Between(today, afterWeek),
        user : {id : userId}
      },
      relations: ['property'],
    });
  }
}
