import { Module } from '@nestjs/common';
import { LovesService } from './loves.service';
import { LovesController } from './loves.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Love } from './entities/love.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { Property } from '../properties/entities/property.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PropertiesModule,
    TypeOrmModule.forFeature([Love, Property]),
  ],
  controllers: [LovesController],
  providers: [LovesService],
})
export class LovesModule {}
