import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ICD11Module } from './icd11/icd11.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    
    // Application modules
    CacheModule,
    ICD11Module,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 