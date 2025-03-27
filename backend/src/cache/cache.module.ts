import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {} 