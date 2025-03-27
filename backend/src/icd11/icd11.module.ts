import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '../cache/cache.module';
import { ICD11Service } from './icd11.service';
import { ICD11Controller } from './icd11.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000, // 10 seconds
      maxRedirects: 5,
    }),
    CacheModule,
  ],
  controllers: [ICD11Controller],
  providers: [ICD11Service],
  exports: [ICD11Service],
})
export class ICD11Module {} 