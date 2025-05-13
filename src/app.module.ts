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
import { CornModule } from './corn/corn.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StripeModule } from './stripe/stripe.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    PropertiesModule,
    AdminModule,
    UploadsModule,
    FavoriteModule,
    PlansModule,
    ContractsModule,
    NotificationsModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          //entities: [Product, User,
          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV !== 'production',
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    AuthModule,
    GeolocationModule,

    FavoriteModule,

    VotesModule,

    OrdersModule,
    ScheduleModule.forRoot(),
    CornModule,
    NotificationsModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
