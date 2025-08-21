/**
 * Tests for template processor functionality
 */

import { TemplateProcessor } from '../utils/template-processor';
import { ProjectConfig } from '../commands/create';

describe('TemplateProcessor', () => {
  let templateProcessor: TemplateProcessor;
  let mockConfig: ProjectConfig;

  beforeEach(() => {
    mockConfig = {
      template: 'default',
      installDependencies: true,
      setupEnvironment: true,
      branding: {
        organizationName: 'Test Healthcare',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        websiteUrl: 'https://test-healthcare.com',
        supportEmail: 'support@test-healthcare.com'
      },
      deployment: {
        provider: 'aws',
        enableCI: true,
        ciProvider: 'github-actions'
      },
      redis: {
        useDocker: true,
        host: 'localhost',
        port: 6379
      },
      whoCredentials: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      }
    };

    templateProcessor = new TemplateProcessor('test-project', mockConfig);
  });

  describe('processTemplate', () => {
    it('should replace simple variables', async () => {
      const template = `
        Organization: {{ORGANIZATION_NAME}}
        Project: {{PROJECT_NAME}}
        Color: {{PRIMARY_COLOR}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('Organization: Test Healthcare');
      expect(result).toContain('Project: test-project');
      expect(result).toContain('Color: #1976d2');
    });

    it('should handle conditional blocks correctly', async () => {
      const template = `
        {{#if_includes_frontend}}
        Frontend is included
        {{/if_includes_frontend}}
        {{#if_includes_backend}}
        Backend is included
        {{/if_includes_backend}}
        {{#if_includes_redis}}
        Redis is included
        {{/if_includes_redis}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('Frontend is included');
      expect(result).toContain('Backend is included');
      expect(result).toContain('Redis is included');
    });

    it('should handle deployment provider conditionals', async () => {
      const template = `
        {{#if_deployment_aws}}
        AWS deployment enabled
        {{/if_deployment_aws}}
        {{#if_deployment_azure}}
        Azure deployment enabled
        {{/if_deployment_azure}}
        {{#if_deployment_gcp}}
        GCP deployment enabled
        {{/if_deployment_gcp}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('AWS deployment enabled');
      expect(result).not.toContain('Azure deployment enabled');
      expect(result).not.toContain('GCP deployment enabled');
    });

    it('should handle WHO credentials conditional', async () => {
      const template = `
        {{#if_who_credentials}}
        WHO API configured
        {{/if_who_credentials}}
      `;

      const result = await templateProcessor.processTemplate(template);
      expect(result).toContain('WHO API configured');
    });

    it('should handle optional fields conditionals', async () => {
      const template = `
        {{#if_org_website}}
        Website: {{ORG_WEBSITE}}
        {{/if_org_website}}
        {{#if_support_email}}
        Support: {{SUPPORT_EMAIL}}
        {{/if_support_email}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('Website: https://test-healthcare.com');
      expect(result).toContain('Support: support@test-healthcare.com');
    });
  });

  describe('template configurations', () => {
    it('should handle frontend-only template', () => {
      const frontendConfig = {
        ...mockConfig,
        template: 'frontend-only'
      };

      const processor = new TemplateProcessor('test-project', frontendConfig);
      
      // Frontend-only should include frontend and shared, but not backend
      expect(processor['context'].INCLUDES_FRONTEND).toBe(true);
      expect(processor['context'].INCLUDES_BACKEND).toBe(false);
      expect(processor['context'].INCLUDES_REDIS).toBe(false);
      expect(processor['context'].INCLUDES_DOCKER).toBe(false);
    });

    it('should handle api-only template', () => {
      const apiConfig = {
        ...mockConfig,
        template: 'api-only'
      };

      const processor = new TemplateProcessor('test-project', apiConfig);
      
      expect(processor['context'].INCLUDES_FRONTEND).toBe(false);
      expect(processor['context'].INCLUDES_BACKEND).toBe(true);
      expect(processor['context'].INCLUDES_REDIS).toBe(true);
      expect(processor['context'].INCLUDES_DOCKER).toBe(true);
    });

    it('should handle minimal template', () => {
      const minimalConfig = {
        ...mockConfig,
        template: 'minimal'
      };

      const processor = new TemplateProcessor('test-project', minimalConfig);
      
      expect(processor['context'].INCLUDES_FRONTEND).toBe(true);
      expect(processor['context'].INCLUDES_BACKEND).toBe(true);
      expect(processor['context'].INCLUDES_REDIS).toBe(false);
      expect(processor['context'].INCLUDES_DOCKER).toBe(false);
    });
  });

  describe('condition evaluation', () => {
    it('should evaluate CI provider conditions correctly', async () => {
      const githubTemplate = `
        {{#if_ci_github}}
        GitHub Actions enabled
        {{/if_ci_github}}
        {{#if_ci_gitlab}}
        GitLab CI enabled
        {{/if_ci_gitlab}}
      `;

      const result = await templateProcessor.processTemplate(githubTemplate);

      expect(result).toContain('GitHub Actions enabled');
      expect(result).not.toContain('GitLab CI enabled');
    });

    it('should handle missing optional fields', async () => {
      const configWithoutOptionals = {
        ...mockConfig,
        branding: {
          organizationName: 'Test Healthcare',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
          // websiteUrl and supportEmail are missing
        }
      };

      const processor = new TemplateProcessor('test-project', configWithoutOptionals);
      
      const template = `
        {{#if_org_website}}
        Website configured
        {{/if_org_website}}
        {{#if_support_email}}
        Support email configured
        {{/if_support_email}}
      `;

      const result = await processor.processTemplate(template);

      expect(result).not.toContain('Website configured');
      expect(result).not.toContain('Support email configured');
    });
  });

  describe('complex template processing', () => {
    it('should handle nested conditionals', async () => {
      const template = `
        {{#if_includes_backend}}
        Backend Configuration:
        {{#if_includes_redis}}
        - Redis caching enabled
        {{/if_includes_redis}}
        {{#if_who_credentials}}
        - WHO API configured
        {{/if_who_credentials}}
        {{/if_includes_backend}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('Backend Configuration:');
      expect(result).toContain('- Redis caching enabled');
      expect(result).toContain('- WHO API configured');
    });

    it('should handle multiple variable replacements', async () => {
      const template = `
        # {{ORGANIZATION_NAME}} ICD-11 Application
        
        Server running on port {{REDIS_PORT}}
        Primary color: {{PRIMARY_COLOR}}
        Secondary color: {{SECONDARY_COLOR}}
        
        {{#if_deployment_aws}}
        Deploy to AWS: {{DEPLOYMENT_PROVIDER}}
        {{/if_deployment_aws}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('# Test Healthcare ICD-11 Application');
      expect(result).toContain('Server running on port 6379');
      expect(result).toContain('Primary color: #1976d2');
      expect(result).toContain('Secondary color: #dc004e');
      expect(result).toContain('Deploy to AWS: aws');
    });
  });

  describe('error handling', () => {
    it('should handle undefined variables gracefully', async () => {
      const template = `
        Organization: {{ORGANIZATION_NAME}}
        Undefined: {{UNDEFINED_VARIABLE}}
        Project: {{PROJECT_NAME}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).toContain('Organization: Test Healthcare');
      expect(result).toContain('Project: test-project');
      expect(result).toContain('Undefined: {{UNDEFINED_VARIABLE}}'); // Should remain unchanged
    });

    it('should handle malformed conditionals gracefully', async () => {
      const template = `
        {{#if_malformed_condition}}
        This should not appear
        {{/if_malformed_condition}}
        
        {{#if_includes_frontend}}
        This should appear
        {{/if_includes_frontend}}
      `;

      const result = await templateProcessor.processTemplate(template);

      expect(result).not.toContain('This should not appear');
      expect(result).toContain('This should appear');
    });
  });
});