import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Application is running properly' })
  getHealth() {
    return this.appService.getHealth();
  }
} 