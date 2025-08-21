import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationService } from '../services/organization.service';
import { AuditLogService } from '../services/audit-log.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateOrganizationUserDto,
} from '../dto/organization.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Organization slug or domain already exists' })
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(@Body() organizationData: CreateOrganizationDto) {
    // In a real implementation, these would come from authentication context
    const createdBy = 'system-user';
    const userEmail = 'system@example.com';

    const organization = await this.organizationService.createOrganization(
      organizationData,
      createdBy,
      userEmail,
    );

    return {
      success: true,
      data: organization,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganizationById(@Param('id', ParseUUIDPipe) id: string) {
    const organization = await this.organizationService.getOrganizationById(id);

    return {
      success: true,
      data: organization,
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiParam({ name: 'slug', description: 'Organization slug' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganizationBySlug(@Param('slug') slug: string) {
    const organization = await this.organizationService.getOrganizationBySlug(slug);

    return {
      success: true,
      data: organization,
    };
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Get organization by domain' })
  @ApiParam({ name: 'domain', description: 'Organization domain' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganizationByDomain(@Param('domain') domain: string) {
    const organization = await this.organizationService.getOrganizationByDomain(domain);

    return {
      success: true,
      data: organization,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Organization slug or domain already exists' })
  async updateOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateOrganizationDto,
  ) {
    // In a real implementation, these would come from authentication context
    const updatedBy = 'system-user';
    const userEmail = 'system@example.com';

    const organization = await this.organizationService.updateOrganization(
      id,
      updateData,
      updatedBy,
      userEmail,
    );

    return {
      success: true,
      data: organization,
    };
  }

  @Put(':id/plan')
  @ApiOperation({ summary: 'Update organization plan' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        plan: {
          type: 'string',
          enum: ['basic', 'professional', 'enterprise'],
        },
      },
      required: ['plan'],
    },
  })
  @ApiResponse({ status: 200, description: 'Organization plan updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateOrganizationPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { plan: 'basic' | 'professional' | 'enterprise' },
  ) {
    // In a real implementation, these would come from authentication context
    const updatedBy = 'system-user';
    const userEmail = 'system@example.com';

    const organization = await this.organizationService.updatePlan(
      id,
      body.plan,
      updatedBy,
      userEmail,
    );

    return {
      success: true,
      data: organization,
    };
  }

  @Post(':id/users')
  @ApiOperation({ summary: 'Add user to organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiBody({ type: CreateOrganizationUserDto })
  @ApiResponse({ status: 201, description: 'User added to organization successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'User already exists in organization' })
  @HttpCode(HttpStatus.CREATED)
  async addUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() userData: CreateOrganizationUserDto,
  ) {
    // In a real implementation, these would come from authentication context
    const invitedBy = 'system-user';
    const userEmail = 'system@example.com';

    const user = await this.organizationService.addUser(id, userData, invitedBy, userEmail);

    return {
      success: true,
      data: user,
    };
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get organization users' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'pending'],
    description: 'Filter users by status',
  })
  @ApiResponse({ status: 200, description: 'Organization users retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganizationUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status?: 'active' | 'inactive' | 'pending',
  ) {
    const users = await this.organizationService.getOrganizationUsers(id, status);

    return {
      success: true,
      data: users,
    };
  }

  @Get(':id/audit-logs')
  @ApiOperation({ summary: 'Get organization audit logs' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of logs to retrieve' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filter by action' })
  @ApiQuery({ name: 'resource', required: false, type: String, description: 'Filter by resource' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['success', 'failed', 'warning'], description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getAuditLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: 'success' | 'failed' | 'warning',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (userId) filters.userId = userId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const result = await this.auditLogService.getOrganizationLogs(id, limit, offset, filters);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id/audit-logs/stats')
  @ApiOperation({ summary: 'Get organization audit log statistics' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back (default: 30)' })
  @ApiResponse({ status: 200, description: 'Audit log statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getAuditLogStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const stats = await this.auditLogService.getOrganizationStats(id, days);

    return {
      success: true,
      data: stats,
    };
  }
}