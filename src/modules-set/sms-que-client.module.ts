import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SMS_SERVICE',
        transport: Transport.RMQ, //AMQP (Advanced Message Queuing Protocol)
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'sms_queue',
          queueOptions: { durable: true },
          // خطأ تضعها هنا noAck: false,
          //  prefetchCount: 1, // هذا يمنع استقبال أكثر من رسالة في نفس الوقت
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SmsQueClientModule {}
