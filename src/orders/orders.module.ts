import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Plan } from '../plans/entities/plan.entity';
import { AuthModule } from '../auth/auth.module';
import Stripe from 'stripe';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule,
    PropertiesModule,
    TypeOrmModule.forFeature([Order, Plan]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
