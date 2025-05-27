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
          ttl: 6 * 1000, //redis
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 4 * 1000, lruSize: 5000 }), //cache
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
