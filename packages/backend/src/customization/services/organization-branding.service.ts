import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../entities/organization.entity';
import { OrganizationBranding } from '../../entities/organization-branding.entity';
import { EncryptionService } from './encryption.service';
import { AuditLogService } from './audit-log.service';
import { FileUploadService } from './file-upload.service';

export interface BrandingTheme {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    info: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  layout: {
    headerHeight: string;
    sidebarWidth: string;
    borderRadius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

export interface CreateBrandingDto {
  logoUrl?: string;
  faviconUrl?: string;
  colorScheme: BrandingTheme['colorScheme'];
  typography?: BrandingTheme['typography'];
  layout?: BrandingTheme['layout'];
  customCss?: string;
}

export interface UpdateBrandingDto extends Partial<CreateBrandingDto> {}

@Injectable()
export class OrganizationBrandingService {
  private readonly logger = new Logger(OrganizationBrandingService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationBranding)
    private readonly brandingRepository: Repository<OrganizationBranding>,
    private readonly encryptionService: EncryptionService,
    private readonly auditLogService: AuditLogService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Get organization branding
   * @param organizationId Organization ID
   */
  async getBranding(organizationId: string): Promise<OrganizationBranding | null> {
    try {
      const branding = await this.brandingRepository.findOne({
        where: { organizationId, isActive: true },
        relations: ['organization'],
      });

      if (!branding) {
        return null;
      }

      // Decrypt custom CSS if present
      if (branding.customCss) {
        try {
          branding.customCss = this.encryptionService.decrypt(branding.customCss);
        } catch (error) {
          this.logger.warn(`Failed to decrypt custom CSS for organization ${organizationId}`);
          branding.customCss = null;
        }
      }

      return branding;
    } catch (error) {
      this.logger.error('Failed to get organization branding', error.stack);
      throw error;
    }
  }

  /**
   * Create or update organization branding
   * @param organizationId Organization ID
   * @param brandingData Branding data
   * @param updatedBy User ID who updated the branding
   * @param userEmail User email
   */
  async upsertBranding(
    organizationId: string,
    brandingData: CreateBrandingDto | UpdateBrandingDto,
    updatedBy: string,
    userEmail: string,
  ): Promise<OrganizationBranding> {
    try {
      // Verify organization exists
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Check if organization has branding feature enabled
      if (!organization.features?.customBranding) {
        throw new BadRequestException('Custom branding feature not available for this organization');
      }

      // Get existing branding
      let existingBranding = await this.brandingRepository.findOne({
        where: { organizationId, isActive: true },
      });

      // Prepare audit log data
      const auditData = {
        organizationId,
        userId: updatedBy,
        userEmail,
        action: existingBranding ? 'update_branding' : 'create_branding',
        resource: 'organization_branding',
        resourceId: existingBranding?.id,
      };

      // Encrypt custom CSS if provided
      let encryptedCustomCss: string | undefined;
      if (brandingData.customCss) {
        encryptedCustomCss = this.encryptionService.encrypt(brandingData.customCss);
      }

      // Set default typography if not provided
      const defaultTypography: BrandingTheme['typography'] = {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.625',
        },
      };

      // Set default layout if not provided
      const defaultLayout: BrandingTheme['layout'] = {
        headerHeight: '64px',
        sidebarWidth: '280px',
        borderRadius: '8px',
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
      };

      if (existingBranding) {
        // Update existing branding
        const oldValues = { ...existingBranding };

        existingBranding.logoUrl = brandingData.logoUrl ?? existingBranding.logoUrl;
        existingBranding.faviconUrl = brandingData.faviconUrl ?? existingBranding.faviconUrl;
        existingBranding.colorScheme = brandingData.colorScheme ?? existingBranding.colorScheme;
        existingBranding.typography = brandingData.typography ?? existingBranding.typography ?? defaultTypography;
        existingBranding.layout = brandingData.layout ?? existingBranding.layout ?? defaultLayout;
        existingBranding.customCss = encryptedCustomCss ?? existingBranding.customCss;
        existingBranding.version = this.generateVersion();

        const savedBranding = await this.brandingRepository.save(existingBranding);

        // Log the update
        await this.auditLogService.logSuccess({
          ...auditData,
          changes: {
            before: {
              logoUrl: oldValues.logoUrl,
              faviconUrl: oldValues.faviconUrl,
              colorScheme: oldValues.colorScheme,
              typography: oldValues.typography,
              layout: oldValues.layout,
              version: oldValues.version,
            },
            after: {
              logoUrl: savedBranding.logoUrl,
              faviconUrl: savedBranding.faviconUrl,
              colorScheme: savedBranding.colorScheme,
              typography: savedBranding.typography,
              layout: savedBranding.layout,
              version: savedBranding.version,
            },
          },
        });

        return savedBranding;
      } else {
        // Create new branding
        const newBranding = this.brandingRepository.create({
          organizationId,
          logoUrl: brandingData.logoUrl,
          faviconUrl: brandingData.faviconUrl,
          colorScheme: brandingData.colorScheme,
          typography: brandingData.typography ?? defaultTypography,
          layout: brandingData.layout ?? defaultLayout,
          customCss: encryptedCustomCss,
          version: this.generateVersion(),
        });

        const savedBranding = await this.brandingRepository.save(newBranding);

        // Log the creation
        await this.auditLogService.logSuccess({
          ...auditData,
          resourceId: savedBranding.id,
          metadata: {
            hasLogo: !!brandingData.logoUrl,
            hasFavicon: !!brandingData.faviconUrl,
            hasCustomCss: !!brandingData.customCss,
            version: savedBranding.version,
          },
        });

        return savedBranding;
      }
    } catch (error) {
      this.logger.error('Failed to upsert organization branding', error.stack);
      throw error;
    }
  }

  /**
   * Generate CSS variables from branding theme
   * @param branding Organization branding
   */
  generateCssVariables(branding: OrganizationBranding): string {
    const cssVars: string[] = [];

    // Color scheme variables
    Object.entries(branding.colorScheme).forEach(([key, value]) => {
      cssVars.push(`  --color-${this.kebabCase(key)}: ${value};`);
    });

    // Typography variables
    if (branding.typography) {
      cssVars.push(`  --font-family: ${branding.typography.fontFamily};`);
      
      Object.entries(branding.typography.fontSize).forEach(([key, value]) => {
        cssVars.push(`  --font-size-${key}: ${value};`);
      });
      
      Object.entries(branding.typography.fontWeight).forEach(([key, value]) => {
        cssVars.push(`  --font-weight-${key}: ${value};`);
      });
      
      Object.entries(branding.typography.lineHeight).forEach(([key, value]) => {
        cssVars.push(`  --line-height-${key}: ${value};`);
      });
    }

    // Layout variables
    if (branding.layout) {
      cssVars.push(`  --header-height: ${branding.layout.headerHeight};`);
      cssVars.push(`  --sidebar-width: ${branding.layout.sidebarWidth};`);
      cssVars.push(`  --border-radius: ${branding.layout.borderRadius};`);
      
      Object.entries(branding.layout.spacing).forEach(([key, value]) => {
        cssVars.push(`  --spacing-${key}: ${value};`);
      });
      
      Object.entries(branding.layout.shadows).forEach(([key, value]) => {
        cssVars.push(`  --shadow-${key}: ${value};`);
      });
    }

    return `:root {\n${cssVars.join('\n')}\n}`;
  }

  /**
   * Generate Material-UI theme configuration
   * @param branding Organization branding
   */
  generateMuiThemeConfig(branding: OrganizationBranding): any {
    const config = {
      palette: {
        mode: 'light',
        primary: {
          main: branding.colorScheme.primary,
        },
        secondary: {
          main: branding.colorScheme.secondary,
        },
        error: {
          main: branding.colorScheme.error,
        },
        warning: {
          main: branding.colorScheme.warning,
        },
        info: {
          main: branding.colorScheme.info,
        },
        success: {
          main: branding.colorScheme.success,
        },
        background: {
          default: branding.colorScheme.background,
          paper: branding.colorScheme.surface,
        },
        text: {
          primary: branding.colorScheme.text,
          secondary: branding.colorScheme.textSecondary,
        },
      },
    };

    if (branding.typography) {
      config['typography'] = {
        fontFamily: branding.typography.fontFamily,
        fontSize: parseFloat(branding.typography.fontSize.base) * 16,
        fontWeightLight: branding.typography.fontWeight.light,
        fontWeightRegular: branding.typography.fontWeight.normal,
        fontWeightMedium: branding.typography.fontWeight.medium,
        fontWeightBold: branding.typography.fontWeight.bold,
      };
    }

    if (branding.layout) {
      config['shape'] = {
        borderRadius: parseFloat(branding.layout.borderRadius),
      };
      
      config['spacing'] = parseFloat(branding.layout.spacing.md) * 16;
    }

    return config;
  }

  /**
   * Reset branding to default
   * @param organizationId Organization ID
   * @param resetBy User ID who reset the branding
   * @param userEmail User email
   */
  async resetBranding(
    organizationId: string,
    resetBy: string,
    userEmail: string,
  ): Promise<void> {
    try {
      const existingBranding = await this.brandingRepository.findOne({
        where: { organizationId, isActive: true },
      });

      if (existingBranding) {
        existingBranding.isActive = false;
        await this.brandingRepository.save(existingBranding);

        // Log the reset
        await this.auditLogService.logSuccess({
          organizationId,
          userId: resetBy,
          userEmail,
          action: 'reset_branding',
          resource: 'organization_branding',
          resourceId: existingBranding.id,
          metadata: {
            previousVersion: existingBranding.version,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to reset organization branding', error.stack);
      throw error;
    }
  }

  private generateVersion(): string {
    return `v${Date.now()}`;
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}