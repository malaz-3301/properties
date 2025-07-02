import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  //Multi-Level Caching L1 , L2
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          ttl: config.get<number>('REDIS_KEY_EXPIRES'), //redis
          stores: [
            //
            new Keyv({
              store: new CacheableMemory({
                ttl: config.get<number>('CACHE_KEY_EXPIRES'),
                lruSize: 5000,
              }), //cache
            }),
            createKeyv(config.get<string>('REDIS')),
          ],
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
