import {
  BadRequestException,
  ClassSerializerInterceptor,
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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Plan, Order, OtpEntity]),
    AuthModule,
    HttpModule,
    GeolocationModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './images/users',
        filename(
          req: e.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
          const filename = `${prefix}-${file.originalname}`;
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
  controllers: [UsersController, UsersAdminController],
  providers: [
    UsersService,
    UsersOtpProvider,
    UsersGetProvider,
    UsersImgProvider,
    UsersDelProvider,
    UsersUpdateProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  exports: [UsersService, UsersOtpProvider, UsersGetProvider],
})
export class UsersModule {}
