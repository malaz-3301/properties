import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Not, Repository } from 'typeorm';
import { UsersGetProvider } from '../users/providers/users-get.provider';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly usersGetProvider: UsersGetProvider,
  ) {}

  create(createPlanDto: CreatePlanDto) {
    return this.planRepository.save(createPlanDto);
  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return this.planRepository.update(id, updatePlanDto);
  }

  async findAll(userId: number) {
    const user = await this.usersGetProvider.findById(userId);
    //شفلي اذا مستخدم الtrial من قبل
    const where = user.hasUsedTrial ? { id: Not(2) } : {};

    return this.planRepository.find({
      where: where,
    });
  }
}
