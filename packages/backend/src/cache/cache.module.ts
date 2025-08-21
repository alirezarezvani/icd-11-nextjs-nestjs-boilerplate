import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import { CacheConfig } from "../config";
import { CacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cacheConfig = configService.get<CacheConfig>("cache");

        if (!cacheConfig) {
          throw new Error("Cache configuration is missing");
        }

        return {
          store: await redisStore({
            socket: {
              host: cacheConfig.host,
              port: cacheConfig.port,
            },
            password: cacheConfig.password || undefined,
            database: cacheConfig.db || 0,
            ttl: cacheConfig.ttl,
          }),
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
