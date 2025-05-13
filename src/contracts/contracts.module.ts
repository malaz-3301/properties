import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Notification } from 'src/notifications/entities/notification.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports : [AuthModule, TypeOrmModule.forFeature([Contract]), UsersModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports : [ContractsService]
})
export class ContractsModule {}
