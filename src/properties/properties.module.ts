import {
  BadRequestException,
  forwardRef,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GeolocationModule } from '../geolocation/geolocation.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { PropertiesImgProvider } from './providers/properties-img.provider';
import { PropertiesDelProvider } from './providers/properties-del.provider';
import { PropertiesGetProvider } from './providers/properties-get.provider';
import { PropertiesAdminController } from './properties-admin.controller';
import { PropertiesUpdateProvider } from './providers/properties-update.provider';
import { AuditModule } from '../audit/audit.module';
import { PropertiesVoViProvider } from './providers/properties-vo-vi.provider';
import { FavoriteModule } from '../favorite/favorite.module';
import { VotesModule } from '../votes/votes.module';
import { UserType } from '../utils/enums';
import { PropertiesAgencyController } from './properties-agency.controller';
import { PropertiesOwnerController } from './properties-owner.controller';
import { ImgProMulterModule } from './img-modules/img-pro-multer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    AuthModule,
    UsersModule,
    GeolocationModule,
    ImgProMulterModule,
    AuditModule,
    FavoriteModule,
    forwardRef(() => VotesModule),
  ],
  controllers: [
    PropertiesController,
    PropertiesAdminController,
    PropertiesOwnerController,
    PropertiesAgencyController,
  ],
  providers: [
    PropertiesService,
    PropertiesUpdateProvider,
    PropertiesImgProvider,
    PropertiesDelProvider,
    PropertiesGetProvider,
    PropertiesVoViProvider,
  ],
  exports: [
    PropertiesService,
    PropertiesUpdateProvider,
    PropertiesImgProvider,
    PropertiesDelProvider,
    PropertiesGetProvider,
    PropertiesVoViProvider,
  ],
})
export class PropertiesModule {}
