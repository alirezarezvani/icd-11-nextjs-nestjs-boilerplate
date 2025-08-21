/**
 * Advanced template management system for ICD-11 healthcare applications
 * Handles template synchronization, versioning, and healthcare-specific customizations
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../utils/logger';

export interface TemplateManifest {
  version: string;
  name: string;
  description: string;
  healthcareCompliance: {
    hipaa: boolean;
    hl7: boolean;
    fhir: boolean;
    gdpr: boolean;
  };
  dependencies: {
    node: string;
    npm: string;
    redis?: string;
    docker?: string;
  };
  features: string[];
  lastUpdated: string;
  checksum: string;
}

export interface TemplateConfig {
  source: 'local' | 'npm' | 'git';
  version?: string;
  registry?: string;
  healthcareProfile: 'hospital' | 'clinic' | 'pharmacy' | 'research' | 'general';
}

export class TemplateManager {
  private templatesDir: string;
  private cacheDir: string;
  private manifestCache: Map<string, TemplateManifest> = new Map();

  constructor(baseDir?: string) {
    this.templatesDir = baseDir || path.resolve(__dirname, '../../templates');
    this.cacheDir = path.join(this.templatesDir, '.cache');
  }

  /**
   * Get available templates with healthcare-specific metadata
   */
  async getAvailableTemplates(): Promise<Map<string, TemplateManifest>> {
    const templates = new Map<string, TemplateManifest>();
    
    // Load local templates
    const localTemplates = await this.loadLocalTemplates();
    localTemplates.forEach((manifest, name) => {
      templates.set(name, manifest);
    });

    // Load remote templates (future enhancement)
    // const remoteTemplates = await this.loadRemoteTemplates();
    
    return templates;
  }

  /**
   * Load local template manifests
   */
  private async loadLocalTemplates(): Promise<Map<string, TemplateManifest>> {
    const templates = new Map<string, TemplateManifest>();
    
    try {
      const templateDirs = await fs.readdir(this.templatesDir, { withFileTypes: true });
      
      for (const dirent of templateDirs) {
        if (dirent.isDirectory() && !dirent.name.startsWith('.')) {
          const templatePath = path.join(this.templatesDir, dirent.name);
          const manifestPath = path.join(templatePath, 'template.manifest.json');
          
          if (await fs.pathExists(manifestPath)) {
            try {
              const manifest = await fs.readJson(manifestPath) as TemplateManifest;
              templates.set(dirent.name, manifest);
            } catch (error) {
              logger.warn(`Failed to load manifest for template: ${dirent.name}`);
            }
          } else {
            // Generate manifest for legacy templates
            const manifest = await this.generateLegacyManifest(dirent.name, templatePath);
            templates.set(dirent.name, manifest);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load local templates:', error);
    }
    
    return templates;
  }

  /**
   * Generate manifest for templates without explicit manifests
   */
  private async generateLegacyManifest(templateName: string, templatePath: string): Promise<TemplateManifest> {
    const packageJsonPath = path.join(templatePath, 'package.json');
    let version = '1.0.0';
    
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        version = packageJson.version || version;
      } catch {
        // Ignore package.json read errors
      }
    }

    return {
      version,
      name: templateName,
      description: this.getTemplateDescription(templateName),
      healthcareCompliance: this.getHealthcareCompliance(templateName),
      dependencies: {
        node: '>=16.0.0',
        npm: '>=8.0.0',
        redis: templateName.includes('redis') ? '>=7.0.0' : undefined,
        docker: templateName !== 'minimal' ? '>=20.10.0' : undefined
      },
      features: this.getTemplateFeatures(templateName),
      lastUpdated: new Date().toISOString(),
      checksum: await this.calculateTemplateChecksum(templatePath)
    };
  }

  /**
   * Get template description based on name
   */
  private getTemplateDescription(templateName: string): string {
    const descriptions: Record<string, string> = {
      'default': 'Full-stack ICD-11 healthcare application with Next.js, NestJS, and Redis',
      'frontend-only': 'Client-side ICD-11 search interface with mock API responses',
      'api-only': 'Backend-only ICD-11 API service with WHO integration',
      'minimal': 'Minimal ICD-11 setup for rapid prototyping',
      'hospital-system': 'Enterprise hospital management system with ICD-11 integration',
      'clinic-management': 'Small clinic management system with patient records',
      'pharmacy-system': 'Pharmacy management with medication coding',
      'research-platform': 'Research platform for medical data analysis'
    };
    
    return descriptions[templateName] || `ICD-11 healthcare template: ${templateName}`;
  }

  /**
   * Get healthcare compliance features for template
   */
  private getHealthcareCompliance(templateName: string): TemplateManifest['healthcareCompliance'] {
    // Default compliance settings based on template
    const baseCompliance = {
      hipaa: false,
      hl7: false,
      fhir: false,
      gdpr: true // Always include GDPR for European compliance
    };

    if (templateName.includes('hospital') || templateName.includes('clinic')) {
      return {
        ...baseCompliance,
        hipaa: true,
        hl7: true,
        fhir: true
      };
    }

    if (templateName.includes('research')) {
      return {
        ...baseCompliance,
        fhir: true
      };
    }

    return baseCompliance;
  }

  /**
   * Get template features
   */
  private getTemplateFeatures(templateName: string): string[] {
    const baseFeatures = ['icd11-integration', 'who-api', 'typescript'];
    
    const featureMap: Record<string, string[]> = {
      'default': [...baseFeatures, 'redis-cache', 'docker', 'full-stack', 'testing'],
      'frontend-only': [...baseFeatures, 'nextjs', 'mock-api', 'responsive-ui'],
      'api-only': [...baseFeatures, 'nestjs', 'swagger-docs', 'health-checks'],
      'minimal': [...baseFeatures, 'lightweight'],
      'hospital-system': [...baseFeatures, 'patient-management', 'hipaa-compliance', 'audit-logs'],
      'clinic-management': [...baseFeatures, 'appointment-scheduling', 'patient-records'],
      'pharmacy-system': [...baseFeatures, 'medication-management', 'prescription-tracking'],
      'research-platform': [...baseFeatures, 'data-analytics', 'export-tools', 'anonymization']
    };
    
    return featureMap[templateName] || baseFeatures;
  }

  /**
   * Calculate template checksum for integrity verification
   */
  private async calculateTemplateChecksum(templatePath: string): Promise<string> {
    // Simple checksum based on template structure
    try {
      const files = await this.getAllTemplateFiles(templatePath);
      const content = files.join('|');
      
      // Simple hash implementation (in production, use crypto)
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(16);
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get all files in template directory
   */
  private async getAllTemplateFiles(templatePath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.readdir(templatePath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        
        const itemPath = path.join(templatePath, item.name);
        
        if (item.isDirectory()) {
          const subFiles = await this.getAllTemplateFiles(itemPath);
          files.push(...subFiles);
        } else {
          files.push(path.relative(templatePath, itemPath));
        }
      }
    } catch {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Validate template integrity
   */
  async validateTemplate(templateName: string): Promise<boolean> {
    const manifest = await this.getTemplateManifest(templateName);
    if (!manifest) return false;

    const templatePath = path.join(this.templatesDir, templateName);
    const currentChecksum = await this.calculateTemplateChecksum(templatePath);
    
    return currentChecksum === manifest.checksum;
  }

  /**
   * Get template manifest
   */
  async getTemplateManifest(templateName: string): Promise<TemplateManifest | null> {
    if (this.manifestCache.has(templateName)) {
      return this.manifestCache.get(templateName)!;
    }

    const templates = await this.getAvailableTemplates();
    const manifest = templates.get(templateName);
    
    if (manifest) {
      this.manifestCache.set(templateName, manifest);
    }
    
    return manifest || null;
  }

  /**
   * Update template from source
   */
  async updateTemplate(templateName: string, config: TemplateConfig): Promise<boolean> {
    const spinner = ora(`Updating template: ${templateName}`).start();
    
    try {
      switch (config.source) {
        case 'local':
          // Templates are already local, validate integrity
          const isValid = await this.validateTemplate(templateName);
          if (isValid) {
            spinner.succeed(`Template ${templateName} is up to date`);
            return true;
          } else {
            spinner.warn(`Template ${templateName} integrity check failed`);
            return false;
          }
          
        case 'npm':
          // Future: Download from npm registry
          spinner.info('NPM template updates not yet implemented');
          return false;
          
        case 'git':
          // Future: Download from git repository
          spinner.info('Git template updates not yet implemented');
          return false;
          
        default:
          spinner.fail(`Unknown template source: ${config.source}`);
          return false;
      }
    } catch (error) {
      spinner.fail(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Create template-specific healthcare configuration
   */
  async generateHealthcareConfig(templateName: string, organizationProfile: string): Promise<any> {
    const manifest = await this.getTemplateManifest(templateName);
    if (!manifest) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const healthcareConfig = {
      compliance: manifest.healthcareCompliance,
      profile: organizationProfile,
      requiredFeatures: manifest.features.filter(f => 
        f.includes('hipaa') || f.includes('hl7') || f.includes('fhir')
      ),
      dataProtection: {
        encryption: manifest.healthcareCompliance.hipaa,
        auditLogs: manifest.healthcareCompliance.hipaa,
        accessControl: true,
        anonymization: organizationProfile === 'research'
      },
      integrations: {
        whoApi: true,
        hl7: manifest.healthcareCompliance.hl7,
        fhir: manifest.healthcareCompliance.fhir
      }
    };

    return healthcareConfig;
  }

  /**
   * Generate template manifests for existing templates
   */
  async generateManifests(): Promise<void> {
    const spinner = ora('Generating template manifests...').start();
    
    try {
      const templates = await this.loadLocalTemplates();
      
      for (const [templateName, manifest] of templates) {
        const manifestPath = path.join(this.templatesDir, templateName, 'template.manifest.json');
        await fs.writeJson(manifestPath, manifest, { spaces: 2 });
      }
      
      spinner.succeed(`Generated manifests for ${templates.size} templates`);
    } catch (error) {
      spinner.fail(`Failed to generate manifests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

export default TemplateManager;