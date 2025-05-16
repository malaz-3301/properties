import { Injectable } from '@nestjs/common';
import { CreateCornDto } from './dto/create-corn.dto';
import { UpdateCornDto } from './dto/update-corn.dto';
import { Cron } from '@nestjs/schedule';
import { Plan } from '../plans/entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { View } from '../views/entities/view.entity';

@Injectable()
export class CornService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(View)
    private readonly viewRepository: Repository<View>,
  ) {}

  //min-hour-day-month-day of week
  @Cron('0 0 * * *')
  async checkExpiredPlans() {
    //جبلي كلشي اوردرات مفعلة وخالص تاريخها
    const orders = await this.orderRepository.find({
      where: {
        planStatus: OrderStatus.ACTIVE,
        planExpiresAt: LessThan(new Date()),
      },
      relations: { user: true },
      select: { user: { id: true } },
    });
    if (orders.length === 0) {
      return 'No expired subscriptions found.';
    }

    //حدث حالة الطلبات وربط المستخدمين مع الخطة
    for (const order of orders) {
      await this.orderRepository.update(order.id, {
        planStatus: OrderStatus.EXPIRED,
      });
      await this.userRepository.update(order.user.id, {
        plan: { id: 1 },
        planId: 1,
      });
    }
  }

  @Cron('0 0 1 */3 *') //every three month
  async deleteViewEntity() {
    await this.viewRepository.clear();
  }
}
