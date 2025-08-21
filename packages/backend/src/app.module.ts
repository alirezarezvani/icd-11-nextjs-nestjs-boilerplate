import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
// import { TypeOrmModule } from "@nestjs/typeorm";  // Temporarily disabled for Phase 2A testing
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { CacheModule } from "./cache/cache.module";
import { ICD11Module } from "./icd11/icd11.module";
// import { CustomizationModule } from "./customization/customization.module";  // Temporarily disabled for Phase 2A testing
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import * as envConfig from "./config";

/**
 * Root application module
 */
@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: Object.values(envConfig),
    }),

    // Database connection - temporarily disabled for Phase 2A testing
    // TypeOrmModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => configService.get('database'),
    //   inject: [ConfigService],
    // }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000, // 1 minute in milliseconds
        limit: 30, // 30 requests per minute
      },
    ]),

    // Application modules
    CacheModule,
    ICD11Module,
    // CustomizationModule,  // Temporarily disabled for Phase 2A testing
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
