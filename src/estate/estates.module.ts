import { Module } from '@nestjs/common';
import { EstateService } from './estates.service';
import { EstateController } from './estates.controller';
import { UsersModule } from '../users/users.module';
import { Estate } from './entities/estate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Estate]), AuthModule],
  controllers: [EstateController],
  providers: [EstateService],
  exports : [EstateService]
})
export class EstateModule {}
