import {
  BadRequestException,
  ClassSerializerInterceptor,
  forwardRef,
  Module,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { HttpModule } from '@nestjs/axios';
import { UsersOtpProvider } from './providers/users-otp.provider';
import { GeolocationModule } from '../geolocation/geolocation.module';
import { UsersAdminController } from './users-admin.controller';
import { UsersGetProvider } from './providers/users-get.provider';
import { UsersImgProvider } from './providers/users-img.provider';
import { UsersDelProvider } from './providers/users-del.provider';
import { UsersUpdateProvider } from './providers/users-update.provider';
import { Plan } from '../plans/entities/plan.entity';
import { Order } from '../orders/entities/order.entity';
import { OtpEntity } from './entities/otp.entity';
import { AuditModule } from '../audit/audit.module';
import { AgenciesVoViProvider } from './providers/agencies-vo-vi.provider';
import { GlobalCacheModule } from '../modules-set/cache-global.module';
import { Statistics } from './entities/statistics.entity';
import { UsersUpgradeController } from './users-upgrade.controller';
import { AgencyInfo } from './entities/agency-info.entity';
import { UsersRegisterProvider } from './providers/users-register-provider';
import { GeoQueClientModule } from '../modules-set/geo-que-client.module';
import { SmsQueClientModule } from '../modules-set/sms-que-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Plan,
      Order,
      OtpEntity,
      Statistics,
      AgencyInfo,
    ]),
    AuthModule,
    HttpModule,
    GeolocationModule,
    AuditModule,
    GeoQueClientModule, // طلبته ضمن الـ provider
    SmsQueClientModule, // طلبته ضمن الـ provider
    MulterModule.register({
      storage: diskStorage({
        destination: './images/users',
        filename(
          req: e.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
          const filename = `${prefix}-${file.originalname}`.replace(
            /[\s,]/g,
            '',
          );
          callback(null, filename);
        },
      }),
      fileFilter(req, file, callback) {
        if (file.mimetype.startsWith('image')) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Unsupported Media Type'), false);
        }

        //لا تنسى المعالجة
      },
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  ],
  controllers: [UsersController, UsersAdminController, UsersUpgradeController],
  providers: [
    UsersService,
    UsersRegisterProvider,
    UsersOtpProvider,
    UsersGetProvider,
    UsersImgProvider,
    UsersDelProvider,
    UsersUpdateProvider,
    AgenciesVoViProvider,
    //Exclude()
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  exports: [
    UsersService,
    UsersOtpProvider,
    UsersGetProvider,
    UsersUpdateProvider,
    AgenciesVoViProvider,
  ],
})
export class UsersModule {}
