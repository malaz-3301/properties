import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UsersOtpProvider } from '../users/providers/users-otp.provider';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User]), JwtModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
