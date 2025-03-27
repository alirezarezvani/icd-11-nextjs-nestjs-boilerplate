import { Injectable, HttpStatus } from '@nestjs/common';
import { ApiSuccessResponse } from './common/interfaces/common.interface';

@Injectable()
export class AppService {
  getHealth(): ApiSuccessResponse<any> {
    return {
      statusCode: HttpStatus.OK,
      data: {
        status: 'ok',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
      message: 'Application is running properly',
    };
  }
} 