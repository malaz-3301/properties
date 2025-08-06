import { Module } from '@nestjs/common';
import { Order } from '../orders/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Plan } from '../plans/entities/plan.entity';
import { View } from '../views/entities/view.entity';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { Cron } from './entities/cron.entity';
import { Property } from '../properties/entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cron, Order, User, Plan, View, Property]),
  ],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
