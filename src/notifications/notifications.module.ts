import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { ContractsModule } from 'src/contracts/contracts.module';
import { Contract } from 'src/contracts/entities/contract.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Contract]), ContractsModule, AuthModule, UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports : [NotificationsService]
})
export class NotificationsModule {}
