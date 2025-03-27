import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ICD11Service } from './icd11.service';

@ApiTags('icd11')
@Controller('icd11')
@UseGuards(ThrottlerGuard)
export class ICD11Controller {
  constructor(private readonly icd11Service: ICD11Service) {}

  @Get('search')
  @ApiOperation({ summary: 'Search ICD-11 by term' })
  @ApiQuery({ name: 'term', type: String, description: 'Search term' })
  @ApiQuery({ name: 'language', type: String, description: 'Language code', required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async search(
    @Query('term') term: string,
    @Query('language') language: string = 'en',
  ) {
    return this.icd11Service.search(term, language);
  }

  @Get('entity/:id')
  @ApiOperation({ summary: 'Get ICD-11 entity details by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Entity ID' })
  @ApiQuery({ name: 'language', type: String, description: 'Language code', required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'Entity details' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEntity(
    @Param('id') id: string,
    @Query('language') language: string = 'en',
  ) {
    return this.icd11Service.getEntity(id, language);
  }
} 