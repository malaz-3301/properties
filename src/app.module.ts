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
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GlobalCacheModule } from './modules-set/cache-global.module';
import { dataSourceOptions } from '../db/data-source';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ImgProMulterModule } from './modules-set/img-pro-multer.module';
import { CronModule } from './cron/cron.module';
import { GeoQueClientModule } from './modules-set/geo-que-client.module';
import { PropertiesProcessor } from './properties/processors/properties.processor';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { UsersProcessor } from './users/processors/users.processor';
import { BannedModule } from './banned/banned.module';
import { SmsQueClientModule } from './modules-set/sms-que-client.module';
import * as path from 'path';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PropertiesModule,
    AdminModule,
    BannedModule,
    UploadsModule,
    FavoriteModule,
    VotesModule,
    GeoQueClientModule,
    SmsQueClientModule,
    PlansModule,
    ContractsModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers : [AcceptLanguageResolver],
      
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

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
    ReportsModule,
    AnalyticsModule,
    CronModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
  ],
  //استدعيته هنا لانه في الداخل يستدعى كثيرا,PropertiesProcessor
  controllers: [AppController, PropertiesProcessor, UsersProcessor],
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
