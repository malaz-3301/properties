import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { FindOperator, Repository } from 'typeorm';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
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
    return this.contractRepository.find({
      where: {
        user: { id: userId },
        validUntil: new FindOperator('moreThan', new Date()),
      },
    });
  }

  getMyExpiredContracts(userId : number) {
    return this.contractRepository.find({
      where: {
        user: { id: userId },
        validUntil: new FindOperator('lessThan', new Date()),
      },
    });
  }

  async getMyContracts(userId : number) {
    const active = await this.getMyActiveContracts(userId);
    const expired = await this.getMyExpiredContracts(userId);
    return {active : active, expired : expired}
  }
}
