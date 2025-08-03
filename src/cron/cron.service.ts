import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Plan } from '../plans/entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { View } from '../views/entities/view.entity';
import { Vote } from '../votes/entities/vote.entity';
import { PriorityRatio } from '../properties/entities/priority-ratio.entity';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(View)
    private readonly viewRepository: Repository<View>,
    private dataSource: DataSource,
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
      return 'No expired subscriptions found this day.';
    }

    //حدث حالة الطلبات وربط المستخدمين مع الخطة
    for (const order of orders) {
      await this.orderRepository.update(order.id, {
        planStatus: OrderStatus.EXPIRED,
      });
      await this.userRepository.update(order.user.id, {
        plan: { id: 1 },
      });
    }
  }

  @Cron('0 0 1 */3 *') //every three month
  async deleteViewEntity() {
    await this.viewRepository.clear();
  }

  //تقليل اولوية التصويت
  @Cron('0 0 * * 0') //يوم الاحد
  async divisionVotes() {
    await this.dataSource.query(
      `
          UPDATE property p
          SET primacy = primacy * 0.5
          WHERE EXISTS (SELECT 1
                        FROM "priority ratio" pr
                        WHERE pr.pro_id = p.id
                          AND pr."voteRatio" > $1 -- المرتفعة فقط
                          AND p.primacy > pr."suitabilityRatio") --ما تنزل عن التقييم الاساسي  
      `,
      [30],
    );
  } //63 total vote
  //تصفير اولوية التصويت
  @Cron('0 0 1 * *')
  async divisionVotes1() {
    await this.dataSource.query(
      `
          UPDATE property p
          SET primacy = primacy - (SELECT pr."voteRatio"
                                   FROM "priority ratio" pr
                                   WHERE pr.pro_id = p.id
                                   LIMIT 1)
      `,
    );

    await this.dataSource.query(`
        UPDATE "priority ratio"
        SET "voteRatio" = 0`);
  } //63 total vote
}
