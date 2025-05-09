import { Module } from '@nestjs/common';
import { EstateService } from './estates.service';
import { EstateController } from './estates.controller';
import { UsersModule } from '../users/users.module';
import { Estate } from './entities/estate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { GeolocationModule } from '../geolocation/geolocation.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    UsersModule,
    PropertiesModule,
    TypeOrmModule.forFeature([Estate]),
    AuthModule,
  ],
  controllers: [EstateController],
  providers: [EstateService],
  exports : [EstateService]
})
export class EstateModule {}
