import { Injectable, Logger } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Between, FindOperator, Repository } from 'typeorm';
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

  getMyActiveContracts(userId: number) {
    return this.userService.getMyActiveContracts(userId);
  }

  getMyExpiredContracts(userId: number) {
    return this.userService.getMyExpiredContracts(userId);
  }

  getMyContracts(userId: number) {
    return this.userService.getMyContracts(userId);
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
}
