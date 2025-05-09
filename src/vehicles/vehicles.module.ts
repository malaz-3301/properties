import {
  BadRequestException,
  forwardRef,
  Module,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { UsersOtpProvider } from '../users/users-otp.provider';
import { GeolocationModule } from 'src/geolocation/geolocation.module';
import { Property } from '../properties/entities/property.entity';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PropertiesModule,
    GeolocationModule,
    TypeOrmModule.forFeature([Vehicle, Property]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
