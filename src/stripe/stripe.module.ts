import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('STRIPE_SECRET_KEY');
        if (!secret) {
          throw new Error('STRIPE_SECRET_KEY is not defined in .env');
        }
        return new Stripe(secret);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['STRIPE_CLIENT'],
})
export class StripeModule {}
