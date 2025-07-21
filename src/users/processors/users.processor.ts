import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  RmqRecordBuilder,
} from '@nestjs/microservices';
import { GeolocationService } from '../../geolocation/geolocation.service';
import { UsersUpdateProvider } from '../providers/users-update.provider';
import { UsersOtpProvider } from '../providers/users-otp.provider';

@Controller()
export class UsersProcessor {
  private readonly logger = new Logger(UsersProcessor.name);

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly usersUpdateProvider: UsersUpdateProvider,
    private readonly usersOtpProvider: UsersOtpProvider,
    @Inject('GEO_SERVICE') private readonly client: ClientProxy,
  ) {}

  @EventPattern('create_user.geo')
  //@Pyaload لفك التشفير
  async handleV1(@Payload() data: any, @Ctx() ctx: RmqContext) {
    // for ack or nack
    const channel = ctx.getChannelRef(); // binding
    const msg = ctx.getMessage();
    const retryCount = msg.properties.headers['x-retry-count'] || 1;

    try {
      this.logger.log(`🚀`);
      const location = await this.geolocationService.reverse_geocoding(
        data.lat,
        data.lon,
      );
      // تحديث بيانات المستخدم بالـ location الجديد
      await this.usersUpdateProvider.updateUserById(data.userId, {
        location: location,
      });
      channel.ack(msg);
    } catch (err) {
      if (retryCount < 2) {
        channel.ack(msg); // لازم ACK قبل ما ترسل نسخة جديدة
        this.client.emit(
          'create_user.geo',
          new RmqRecordBuilder({
            ...data,
          })
            .setOptions({
              headers: {
                'x-retry-count': retryCount + 1,
              },
              persistent: true,
            })
            .build(),
        );
      } else {
        channel.ack(msg);
        this.logger.error(`🚫`);
      }
    }
  }

  @EventPattern('create_user.sms')
  async handleV2(@Payload() data: any, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    const retryCount = msg.properties.headers['x-retry-count'] || 1;

    try {
      this.logger.log(`🚀`);
      await this.usersOtpProvider.sendSms(data.phone, data.message);
      channel.ack(msg);
    } catch (err) {
      if (retryCount < 2) {
        channel.ack(msg);
        this.client.emit(
          'create_user.sms',
          new RmqRecordBuilder({
            ...data,
          })
            .setOptions({
              headers: {
                'x-retry-count': retryCount + 1,
              },
              persistent: true,
            })
            .build(),
        );
      } else {
        channel.ack(msg);
        this.logger.error(`🚫`);
      }
    }
  }
}
