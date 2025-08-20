/**
 * Template processor for generating customized project files
 * Handles dynamic template replacement and conditional content
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectConfig } from '../commands/create';

export interface TemplateContext {
  PROJECT_NAME: string;
  ORGANIZATION_NAME: string;
  PRIMARY_COLOR: string;
  SECONDARY_COLOR: string;
  ORG_WEBSITE?: string;
  SUPPORT_EMAIL?: string;
  DEPLOYMENT_PROVIDER: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_USE_DOCKER: boolean;
  INCLUDES_FRONTEND: boolean;
  INCLUDES_BACKEND: boolean;
  INCLUDES_REDIS: boolean;
  INCLUDES_DOCKER: boolean;
  WHO_CLIENT_ID?: string;
  WHO_CLIENT_SECRET?: string;
  CI_PROVIDER?: string;
}

export class TemplateProcessor {
  private context: TemplateContext;
  private templatesDir: string;

  constructor(projectName: string, config: ProjectConfig) {
    this.templatesDir = path.resolve(__dirname, '../../templates');
    this.context = this.buildContext(projectName, config);
  }

  private buildContext(projectName: string, config: ProjectConfig): TemplateContext {
    const templateConfig = this.getTemplateConfig(config.template);
    
    return {
      PROJECT_NAME: projectName,
      ORGANIZATION_NAME: config.branding.organizationName,
      PRIMARY_COLOR: config.branding.primaryColor,
      SECONDARY_COLOR: config.branding.secondaryColor,
      ORG_WEBSITE: config.branding.websiteUrl,
      SUPPORT_EMAIL: config.branding.supportEmail,
      DEPLOYMENT_PROVIDER: config.deployment.provider,
      REDIS_HOST: config.redis.host,
      REDIS_PORT: config.redis.port.toString(),
      REDIS_USE_DOCKER: config.redis.useDocker,
      INCLUDES_FRONTEND: templateConfig.includes.includes('frontend'),
      INCLUDES_BACKEND: templateConfig.includes.includes('backend'),
      INCLUDES_REDIS: templateConfig.includes.includes('redis'),
      INCLUDES_DOCKER: templateConfig.includes.includes('docker'),
      WHO_CLIENT_ID: config.whoCredentials?.clientId,
      WHO_CLIENT_SECRET: config.whoCredentials?.clientSecret,
      CI_PROVIDER: config.deployment.ciProvider
    };
  }

  private getTemplateConfig(template: string) {
    // Default configuration based on template type
    const configs = {
      default: {
        includes: ['frontend', 'backend', 'shared', 'docker', 'redis']
      },
      'frontend-only': {
        includes: ['frontend', 'shared']
      },
      'api-only': {
        includes: ['backend', 'shared', 'docker', 'redis']
      },
      minimal: {
        includes: ['frontend', 'backend', 'shared']
      }
    };

    return configs[template as keyof typeof configs] || configs.default;
  }

  /**
   * Process a template file and replace variables
   */
  async processTemplate(templateContent: string): Promise<string> {
    let processed = templateContent;

    // Replace simple variables {{VARIABLE_NAME}}
    Object.entries(this.context).forEach(([key, value]) => {
      if (value !== undefined) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processed = processed.replace(regex, String(value));
      }
    });

    // Handle conditional blocks
    processed = this.processConditionals(processed);

    return processed;
  }

  /**
   * Process conditional blocks in templates
   * Supports: {{#if_condition}}...{{/if_condition}}
   */
  private processConditionals(content: string): string {
    let processed = content;

    // Process conditional blocks
    const conditionalRegex = /{{#if_([^}]+)}}([\s\S]*?){{\/if_\1}}/g;
    
    processed = processed.replace(conditionalRegex, (match, condition, block) => {
      if (this.evaluateCondition(condition)) {
        return block;
      }
      return '';
    });

    // Handle special includes patterns like {{#if_includes_redis}}
    const includesRegex = /{{#if_includes_([^}]+)}}([\s\S]*?){{\/if_includes_\1}}/g;
    
    processed = processed.replace(includesRegex, (match, component, block) => {
      if (this.evaluateIncludesCondition(component)) {
        return block;
      }
      return '';
    });

    return processed;
  }

  /**
   * Evaluate includes conditions for template patterns
   */
  private evaluateIncludesCondition(component: string): boolean {
    switch (component) {
      case 'frontend':
        return this.context.INCLUDES_FRONTEND;
      case 'backend':
        return this.context.INCLUDES_BACKEND;
      case 'redis':
        return this.context.INCLUDES_REDIS;
      case 'docker':
        return this.context.INCLUDES_DOCKER;
      default:
        return false;
    }
  }

  /**
   * Evaluate template conditions
   */
  private evaluateCondition(condition: string): boolean {
    switch (condition) {
      case 'includes_frontend':
        return this.context.INCLUDES_FRONTEND;
      case 'includes_backend':
        return this.context.INCLUDES_BACKEND;
      case 'includes_redis':
        return this.context.INCLUDES_REDIS;
      case 'includes_docker':
        return this.context.INCLUDES_DOCKER;
      case 'org_website':
        return !!this.context.ORG_WEBSITE;
      case 'support_email':
        return !!this.context.SUPPORT_EMAIL;
      case 'who_credentials':
        return !!(this.context.WHO_CLIENT_ID && this.context.WHO_CLIENT_SECRET);
      case 'deployment_docker':
        return this.context.DEPLOYMENT_PROVIDER === 'docker';
      case 'deployment_aws':
        return this.context.DEPLOYMENT_PROVIDER === 'aws';
      case 'deployment_azure':
        return this.context.DEPLOYMENT_PROVIDER === 'azure';
      case 'deployment_gcp':
        return this.context.DEPLOYMENT_PROVIDER === 'gcp';
      case 'ci_github':
        return this.context.CI_PROVIDER === 'github-actions';
      case 'ci_gitlab':
        return this.context.CI_PROVIDER === 'gitlab-ci';
      case 'monitoring':
        return false; // Optional feature for future
      default:
        return false;
    }
  }

  /**
   * Generate Docker Compose file from template
   */
  async generateDockerCompose(targetDir: string): Promise<void> {
    const templatePath = path.join(this.templatesDir, 'deployment', 'docker', 'docker-compose.template.yml');
    
    if (await fs.pathExists(templatePath)) {
      const template = await fs.readFile(templatePath, 'utf-8');
      const processed = await this.processTemplate(template);
      
      await fs.writeFile(
        path.join(targetDir, 'docker-compose.prod.yml'),
        processed
      );
    }
  }

  /**
   * Generate CI/CD pipeline files
   */
  async generateCIPipeline(targetDir: string): Promise<void> {
    if (!this.context.CI_PROVIDER) return;

    const templateFile = this.context.CI_PROVIDER === 'github-actions' 
      ? 'github-actions.template.yml'
      : 'gitlab-ci.template.yml';
    
    const templatePath = path.join(this.templatesDir, 'ci-cd', templateFile);
    
    if (await fs.pathExists(templatePath)) {
      const template = await fs.readFile(templatePath, 'utf-8');
      const processed = await this.processTemplate(template);
      
      if (this.context.CI_PROVIDER === 'github-actions') {
        const workflowsDir = path.join(targetDir, '.github', 'workflows');
        await fs.ensureDir(workflowsDir);
        await fs.writeFile(
          path.join(workflowsDir, 'deploy.yml'),
          processed
        );
      } else {
        await fs.writeFile(
          path.join(targetDir, '.gitlab-ci.yml'),
          processed
        );
      }
    }
  }

  /**
   * Generate cloud provider deployment files
   */
  async generateCloudDeployment(targetDir: string): Promise<void> {
    const { DEPLOYMENT_PROVIDER } = this.context;
    
    if (DEPLOYMENT_PROVIDER === 'none' || DEPLOYMENT_PROVIDER === 'docker') {
      return;
    }

    const deploymentDir = path.join(targetDir, DEPLOYMENT_PROVIDER);
    await fs.ensureDir(deploymentDir);

    // Generate provider-specific configuration
    switch (DEPLOYMENT_PROVIDER) {
      case 'aws':
        await this.generateAWSConfig(deploymentDir);
        break;
      case 'azure':
        await this.generateAzureConfig(deploymentDir);
        break;
      case 'gcp':
        await this.generateGCPConfig(deploymentDir);
        break;
    }
  }

  private async generateAWSConfig(deploymentDir: string): Promise<void> {
    // ECS Task Definition
    const taskDefinition: any = {
      family: `${this.context.PROJECT_NAME}-task`,
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      cpu: '512',
      memory: '1024',
      executionRoleArn: `arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole`,
      containerDefinitions: []
    };

    const containers = [];

    if (this.context.INCLUDES_FRONTEND) {
      containers.push({
        name: 'frontend',
        image: `${this.context.PROJECT_NAME}-frontend:latest`,
        portMappings: [{ containerPort: 3000, protocol: 'tcp' }],
        environment: [
          { name: 'NEXT_PUBLIC_APP_NAME', value: this.context.ORGANIZATION_NAME },
          { name: 'NEXT_PUBLIC_PRIMARY_COLOR', value: this.context.PRIMARY_COLOR },
          { name: 'NEXT_PUBLIC_SECONDARY_COLOR', value: this.context.SECONDARY_COLOR }
        ]
      });
    }

    if (this.context.INCLUDES_BACKEND) {
      containers.push({
        name: 'backend',
        image: `${this.context.PROJECT_NAME}-backend:latest`,
        portMappings: [{ containerPort: 3003, protocol: 'tcp' }],
        environment: [
          { name: 'ORG_NAME', value: this.context.ORGANIZATION_NAME },
          { name: 'NODE_ENV', value: 'production' }
        ]
      });
    }

    taskDefinition.containerDefinitions = containers;

    await fs.writeJson(
      path.join(deploymentDir, 'task-definition.json'),
      taskDefinition,
      { spaces: 2 }
    );
  }

  private async generateAzureConfig(deploymentDir: string): Promise<void> {
    const containerAppConfig = {
      '$schema': 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
      contentVersion: '1.0.0.0',
      parameters: {
        containerAppName: {
          type: 'string',
          defaultValue: this.context.PROJECT_NAME
        },
        organizationName: {
          type: 'string',
          defaultValue: this.context.ORGANIZATION_NAME
        }
      },
      resources: [
        {
          type: 'Microsoft.App/containerApps',
          apiVersion: '2022-03-01',
          name: '[parameters(\'containerAppName\')]',
          location: '[resourceGroup().location]',
          properties: {
            configuration: {
              ingress: {
                external: true,
                targetPort: this.context.INCLUDES_FRONTEND ? 3000 : 3003
              }
            },
            template: {
              containers: this.generateAzureContainers()
            }
          }
        }
      ]
    };

    await fs.writeJson(
      path.join(deploymentDir, 'container-app-template.json'),
      containerAppConfig,
      { spaces: 2 }
    );
  }

  private generateAzureContainers(): any[] {
    const containers = [];

    if (this.context.INCLUDES_FRONTEND) {
      containers.push({
        name: 'frontend',
        image: `${this.context.PROJECT_NAME}-frontend:latest`,
        env: [
          { name: 'NEXT_PUBLIC_APP_NAME', value: this.context.ORGANIZATION_NAME },
          { name: 'NEXT_PUBLIC_PRIMARY_COLOR', value: this.context.PRIMARY_COLOR }
        ]
      });
    }

    if (this.context.INCLUDES_BACKEND) {
      containers.push({
        name: 'backend',
        image: `${this.context.PROJECT_NAME}-backend:latest`,
        env: [
          { name: 'ORG_NAME', value: this.context.ORGANIZATION_NAME },
          { name: 'NODE_ENV', value: 'production' }
        ]
      });
    }

    return containers;
  }

  private async generateGCPConfig(deploymentDir: string): Promise<void> {
    if (this.context.INCLUDES_FRONTEND) {
      const cloudRunConfig = {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: {
          name: this.context.PROJECT_NAME,
          annotations: {
            'run.googleapis.com/ingress': 'all'
          }
        },
        spec: {
          template: {
            metadata: {
              annotations: {
                'autoscaling.knative.dev/maxScale': '10'
              }
            },
            spec: {
              containers: [{
                image: `gcr.io/PROJECT_ID/${this.context.PROJECT_NAME}:latest`,
                env: [
                  { name: 'NEXT_PUBLIC_APP_NAME', value: this.context.ORGANIZATION_NAME },
                  { name: 'NEXT_PUBLIC_PRIMARY_COLOR', value: this.context.PRIMARY_COLOR }
                ]
              }]
            }
          }
        }
      };

      await fs.writeFile(
        path.join(deploymentDir, 'cloud-run.yaml'),
        JSON.stringify(cloudRunConfig, null, 2)
      );
    }
  }

  /**
   * Generate mock API service for frontend-only template
   */
  async generateMockAPI(targetDir: string): Promise<void> {
    if (!this.context.INCLUDES_FRONTEND || this.context.INCLUDES_BACKEND) {
      return; // Only for frontend-only templates
    }

    const mockApiPath = path.join(this.templatesDir, 'frontend-only', 'mock-api.ts');
    
    if (await fs.pathExists(mockApiPath)) {
      const mockApi = await fs.readFile(mockApiPath, 'utf-8');
      const processed = await this.processTemplate(mockApi);
      
      await fs.writeFile(
        path.join(targetDir, 'packages', 'frontend', 'services', 'mock-api.ts'),
        processed
      );
    }
  }
}