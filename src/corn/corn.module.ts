import { Module } from '@nestjs/common';
import { CornService } from './corn.service';
import { CornController } from './corn.controller';
import { Order } from '../orders/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corn } from './entities/corn.entity';
import { User } from '../users/entities/user.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Corn, Order, User, Plan])],
  controllers: [CornController],
  providers: [CornService],
})
export class CornModule {}
