import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { CacheModule } from "@nestjs/cache-manager";
import { ICD11Service } from "./icd11.service";
import { ICD11Controller } from "./icd11.controller";
import * as https from "https";

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }),
    CacheModule.register({
      ttl: 3600, // 1 hour
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [ICD11Controller],
  providers: [ICD11Service],
  exports: [ICD11Service],
})
export class ICD11Module {}
