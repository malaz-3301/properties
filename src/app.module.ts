import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import * as process from 'node:process';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { FavoriteModule } from './favorite/favorite.module';
import { PlansModule } from './plans/plans.module';
import { ContractsModule } from './contracts/contracts.module';
import { VotesModule } from './votes/votes.module';
import { OrdersModule } from './orders/orders.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StripeModule } from './stripe/stripe.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { rateLimiting } from './utils/constants';
import { ThrottlerProxyGuard } from './throttler-proxy.guard';
import { ViewsModule } from './views/views.module';
import { RequestsModule } from './requests/requests.module';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GlobalCacheModule } from './modules-set/cache-global.module';
import { dataSourceOptions } from '../db/data-source';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ImgProMulterModule } from './modules-set/img-pro-multer.module';
import { PostgresSetModule } from './modules-set/postgres-set.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    UsersModule,
    PropertiesModule,
    AdminModule,
    UploadsModule,
    FavoriteModule,
    VotesModule,
    PlansModule,
    ContractsModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    AuthModule,
    GeolocationModule,
    OrdersModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
    StripeModule,
    AuditModule,
    GlobalCacheModule,
    ThrottlerModule.forRoot({
      //first policy
      throttlers: rateLimiting,
    }),
    ViewsModule,
    RequestsModule,
    ReportsModule,
    AnalyticsModule,
    ImgProMulterModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerProxyGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}

//    TypeOrmModule.forRoot(dataSourceOptions),
//   PostgresSetModule,