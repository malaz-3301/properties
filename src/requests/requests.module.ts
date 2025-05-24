import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { ContractsModule } from 'src/contracts/contracts.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports : [AuthModule, TypeOrmModule.forFeature([Request]), ContractsModule, NotificationsModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
