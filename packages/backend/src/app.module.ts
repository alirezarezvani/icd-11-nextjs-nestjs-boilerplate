import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { AuthMiddleware } from "./auth/middleware/auth.middleware";
import { CacheModule } from "./cache/cache.module";
import { ICD11Module } from "./icd11/icd11.module";
import { AuthModule } from "./auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
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

    // Database connection - simplified for Phase 3A
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'icd11_healthcare',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000, // 1 minute in milliseconds
        limit: 30, // 30 requests per minute
      },
    ]),

    // JWT Module for global access
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),

    // Application modules
    CacheModule,
    ICD11Module,
    AuthModule,
    // CustomizationModule,  // Temporarily disabled for Phase 2A testing
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Note: Authentication is handled by middleware for flexible public/private endpoint support
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
    // Apply logging middleware first
    consumer.apply(LoggerMiddleware).forRoutes("*");
    
    // Apply authentication middleware after logging
    consumer.apply(AuthMiddleware).forRoutes("*");
  }
}
