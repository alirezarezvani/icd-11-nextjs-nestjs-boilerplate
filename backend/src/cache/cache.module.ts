import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CacheConfig } from '../config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cacheConfig = configService.get<CacheConfig>('cache');
        return {
          store: await redisStore({
            socket: {
              host: cacheConfig.host,
              port: cacheConfig.port,
            },
            password: cacheConfig.password,
            database: cacheConfig.db,
          }),
          ttl: cacheConfig.ttl * 1000, // convert to milliseconds
          max: 1000, // maximum number of items in cache
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {} 