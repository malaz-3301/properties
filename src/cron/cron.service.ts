import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Plan } from '../plans/entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { View } from '../views/entities/view.entity';
import { Vote } from '../votes/entities/vote.entity';
import { PriorityRatio } from '../properties/entities/priority-ratio.entity';
import { Property } from '../properties/entities/property.entity';
import { OrderStatus, PropertyStatus } from '../utils/enums';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(View)
    private readonly viewRepository: Repository<View>,
    private dataSource: DataSource,
  ) {}

  //min-hour-day-month-day of week
  @Cron('0 0 * * *')
  async checkExpiredPlans() {
    //جبلي كلشي اوردرات مفعلة وخالص تاريخها
    //عملت اثنين WITH CTE
    const action = await this.dataSource.query(
      `WITH expired_orders AS ( -- تحديث الاشتراكات المنتهية 
          UPDATE orders o
              SET "planStatus" = $1
              WHERE o."planStatus" = $2
                  AND o."planExpiresAt" < $3
              RETURNING o."userId"),
            updated_users AS ( --ارجاع الخطة المجانية للمستخدمين  
                UPDATE users u
                    SET "planId" = $4
                    FROM expired_orders eo
                    WHERE u.id = eo."userId"
                    RETURNING u.id)
       UPDATE property up --اخفاء العقارات للمستخدمين المنتهية خططهم
       SET "status" = $5
       FROM updated_users uu
       WHERE up."agencyId" = uu.id
       RETURNING up.id; -- لمعرفة كم حدوية تم تعديلها action

      `,
      [
        OrderStatus.EXPIRED,
        OrderStatus.ACTIVE,
        new Date(),
        1,
        PropertyStatus.HIDDEN,
      ],
    );

    if (action.length === 0) {
      return 'No expired subscriptions found this day.';
    } else return action.length;
  }

  @Cron('0 0 1 */3 *') // كل 3 شهور
  async deleteViewEntity() {
    //truncate clear  & reseeding id
    await this.dataSource.query(`
    TRUNCATE TABLE "views" RESTART IDENTITY CASCADE;
  `);
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
