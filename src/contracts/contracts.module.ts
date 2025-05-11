import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports : [AuthModule, TypeOrmModule.forFeature([Contract]), ],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
