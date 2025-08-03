import { forwardRef, Module } from '@nestjs/common';
import { BannedService } from './banned.service';
import { BannedController } from './banned.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banned } from './entities/banned.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banned]),
    forwardRef(() => AuthModule),
    AuditModule,
  ],
  controllers: [BannedController],
  providers: [BannedService],
  exports: [BannedService],
})
export class BannedModule {}
