import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ICD11Service } from './icd11.service';
import { ICD11Controller } from './icd11.controller';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    CacheModule,
  ],
  controllers: [ICD11Controller],
  providers: [ICD11Service],
  exports: [ICD11Service],
})
export class ICD11Module {} 