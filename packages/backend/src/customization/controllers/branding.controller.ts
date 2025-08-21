import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationBrandingService } from '../services/organization-branding.service';
import { FileUploadService } from '../services/file-upload.service';
import { CreateBrandingDto, UpdateBrandingDto } from '../dto/branding.dto';

@ApiTags('Organization Branding')
@Controller('organizations/:organizationId/branding')
export class BrandingController {
  constructor(
    private readonly brandingService: OrganizationBrandingService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get organization branding' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization branding retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization or branding not found' })
  async getBranding(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    const branding = await this.brandingService.getBranding(organizationId);
    return {
      success: true,
      data: branding,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create organization branding' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiBody({ type: CreateBrandingDto })
  @ApiResponse({ status: 201, description: 'Organization branding created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @HttpCode(HttpStatus.CREATED)
  async createBranding(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() brandingData: CreateBrandingDto,
  ) {
    // In a real implementation, these would come from authentication context
    const updatedBy = 'system-user';
    const userEmail = 'system@example.com';

    const branding = await this.brandingService.upsertBranding(
      organizationId,
      brandingData,
      updatedBy,
      userEmail,
    );

    return {
      success: true,
      data: branding,
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update organization branding' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiBody({ type: UpdateBrandingDto })
  @ApiResponse({ status: 200, description: 'Organization branding updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateBranding(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() brandingData: UpdateBrandingDto,
  ) {
    // In a real implementation, these would come from authentication context
    const updatedBy = 'system-user';
    const userEmail = 'system@example.com';

    const branding = await this.brandingService.upsertBranding(
      organizationId,
      brandingData,
      updatedBy,
      userEmail,
    );

    return {
      success: true,
      data: branding,
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Reset organization branding to default' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization branding reset successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @HttpCode(HttpStatus.OK)
  async resetBranding(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    // In a real implementation, these would come from authentication context
    const resetBy = 'system-user';
    const userEmail = 'system@example.com';

    await this.brandingService.resetBranding(organizationId, resetBy, userEmail);

    return {
      success: true,
      message: 'Organization branding reset to default',
    };
  }

  @Get('css-variables')
  @ApiOperation({ summary: 'Get CSS variables for organization branding' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'CSS variables generated successfully' })
  @ApiResponse({ status: 404, description: 'Organization or branding not found' })
  async getCssVariables(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    const branding = await this.brandingService.getBranding(organizationId);
    
    if (!branding) {
      return {
        success: true,
        data: {
          css: ':root { /* Default theme */ }',
        },
      };
    }

    const cssVariables = this.brandingService.generateCssVariables(branding);

    return {
      success: true,
      data: {
        css: cssVariables,
        version: branding.version,
      },
    };
  }

  @Get('mui-theme')
  @ApiOperation({ summary: 'Get Material-UI theme configuration for organization branding' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Material-UI theme configuration generated successfully' })
  @ApiResponse({ status: 404, description: 'Organization or branding not found' })
  async getMuiTheme(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    const branding = await this.brandingService.getBranding(organizationId);
    
    if (!branding) {
      return {
        success: true,
        data: {
          theme: {},
        },
      };
    }

    const muiTheme = this.brandingService.generateMuiThemeConfig(branding);

    return {
      success: true,
      data: {
        theme: muiTheme,
        version: branding.version,
      },
    };
  }

  @Post('upload/logo')
  @ApiOperation({ summary: 'Upload organization logo' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Logo file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or request data' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadLogo(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // In a real implementation, this would come from authentication context
    const uploadedBy = 'system-user';

    const uploadResult = await this.fileUploadService.uploadFile(
      file,
      organizationId,
      uploadedBy,
      'logo',
      { altText: 'Organization logo' },
    );

    return {
      success: true,
      data: uploadResult,
    };
  }

  @Post('upload/favicon')
  @ApiOperation({ summary: 'Upload organization favicon' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Favicon file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Favicon uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or request data' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFavicon(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // In a real implementation, this would come from authentication context
    const uploadedBy = 'system-user';

    const uploadResult = await this.fileUploadService.uploadFile(
      file,
      organizationId,
      uploadedBy,
      'favicon',
      { altText: 'Organization favicon' },
    );

    return {
      success: true,
      data: uploadResult,
    };
  }
}