/**
 * Project scaffolding utilities
 * Handles copying templates and generating project files
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from './logger';
import { TemplateProcessor } from './template-processor';

import { ProjectConfig } from '../commands/create';

export interface ScaffoldOptions {
  projectName: string;
  targetPath: string;
  config: ProjectConfig;
}

export class ProjectScaffolder {
  private options: ScaffoldOptions;
  private spinner: any;
  private templateProcessor: TemplateProcessor;

  constructor(options: ScaffoldOptions) {
    this.options = options;
    this.templateProcessor = new TemplateProcessor(options.projectName, options.config);
  }

  get template(): string {
    return this.options.config.template;
  }

  get branding() {
    return this.options.config.branding;
  }

  get deployment() {
    return this.options.config.deployment;
  }

  async scaffold(): Promise<void> {
    try {
      await this.createProjectDirectory();
      await this.copyTemplate();
      await this.generatePackageJson();
      await this.generateEnvironmentFiles();
      await this.generateBrandingFiles();
      await this.generateDeploymentFiles();
      await this.generateTemplateFiles();
      
      await this.initializeGit();
      
      if (this.options.config.installDependencies) {
        await this.runEnvironmentSetup();
      } else {
        this.showSuccessMessage();
      }
      
    } catch (error) {
      this.spinner?.fail('Failed to create project');
      throw error;
    }
  }

  private async createProjectDirectory(): Promise<void> {
    this.spinner = ora('Creating project directory...').start();
    
    await fs.ensureDir(this.options.targetPath);
    
    this.spinner.succeed('Project directory created');
  }

  private async copyTemplate(): Promise<void> {
    this.spinner = ora('Copying template files...').start();
    
    const sourceRoot = path.resolve(__dirname, '../../../../');
    const { template } = this.options.config;
    
    // Copy based on template selection
    if (template === 'frontend-only') {
      await this.copyFrontendOnly(sourceRoot);
    } else if (template === 'api-only') {
      await this.copyBackendOnly(sourceRoot);
    } else if (template === 'minimal') {
      await this.copyMinimalTemplate(sourceRoot);
    } else {
      // Default: full stack
      await this.copyFullStack(sourceRoot);
    }

    // Ensure PostCSS config exists in frontend (only for templates that include frontend)
    if (template !== 'api-only') {
      const postCSSConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

      await fs.writeFile(
        path.join(this.options.targetPath, 'packages', 'frontend', 'postcss.config.js'),
        postCSSConfig
      );
    }

    this.spinner.succeed('Template files copied');
  }

  private async generatePackageJson(): Promise<void> {
    this.spinner = ora('Generating package.json...').start();
    
    const rootPackageJson = {
      name: this.options.projectName,
      version: '1.0.0',
      description: 'ICD-11 Healthcare Application',
      private: true,
      workspaces: [
        'packages/*'
      ],
      scripts: {
        'dev': 'turbo run dev --parallel',
        'build': 'turbo run build',
        'start': 'turbo run start',
        'lint': 'turbo run lint',
        'test': 'turbo run test',
        'install:all': 'npm install && npm run install:workspaces',
        'install:workspaces': 'npm install --workspaces',
        'docker:up': 'docker-compose up',
        'docker:down': 'docker-compose down',
        'docker:build': 'docker-compose build'
      },
      devDependencies: {
        'turbo': '^2.5.6'
      },
      engines: {
        node: '>=16.0.0',
        npm: '>=8.0.0'
      }
    };

    await fs.writeJson(
      path.join(this.options.targetPath, 'package.json'),
      rootPackageJson,
      { spaces: 2 }
    );

    // Generate turbo.json
    const turboConfig = {
      $schema: 'https://turbo.build/schema.json',
      tasks: {
        build: {
          dependsOn: ['^build'],
          outputs: ['dist/**', '.next/**']
        },
        dev: {
          cache: false,
          persistent: true
        },
        lint: {
          outputs: []
        },
        test: {
          outputs: ['coverage/**']
        }
      }
    };

    await fs.writeJson(
      path.join(this.options.targetPath, 'turbo.json'),
      turboConfig,
      { spaces: 2 }
    );

    this.spinner.succeed('Configuration files generated');
  }

  private async generateEnvironmentFiles(): Promise<void> {
    if (!this.options.config.setupEnvironment) return;

    this.spinner = ora('Setting up environment files...').start();

    const { config } = this.options;
    
    // Backend .env template
    let backendEnvTemplate = `# WHO ICD-11 API Configuration
`;
    
    if (config.whoCredentials) {
      backendEnvTemplate += `ICD11_CLIENT_ID=${config.whoCredentials.clientId}
ICD11_CLIENT_SECRET=${config.whoCredentials.clientSecret}
`;
    } else {
      backendEnvTemplate += `ICD11_CLIENT_ID=your_who_client_id_here
ICD11_CLIENT_SECRET=your_who_client_secret_here
`;
    }
    
    backendEnvTemplate += `
# API Configuration
PORT=3003
CORS_ORIGINS=http://localhost:3000

# Redis Configuration
REDIS_HOST=${config.redis.host}
REDIS_PORT=${config.redis.port}
`;
    
    if (config.redis.useDocker) {
      backendEnvTemplate += `REDIS_DOCKER=true
`;
    }
    
    backendEnvTemplate += `
# Application Configuration
NODE_ENV=development

# Healthcare Organization
ORG_NAME=${config.branding.organizationName}
`;
    
    if (config.branding.websiteUrl) {
      backendEnvTemplate += `ORG_WEBSITE=${config.branding.websiteUrl}
`;
    }
    
    if (config.branding.supportEmail) {
      backendEnvTemplate += `SUPPORT_EMAIL=${config.branding.supportEmail}
`;
    }

    if (config.template !== 'frontend-only') {
      await fs.writeFile(
        path.join(this.options.targetPath, 'packages', 'backend', '.env.example'),
        backendEnvTemplate
      );
    }

    // Frontend .env.local template
    if (config.template !== 'api-only') {
      const frontendEnvTemplate = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=${config.branding.organizationName}
NEXT_PUBLIC_PROJECT_NAME=${this.options.projectName}

# Branding
NEXT_PUBLIC_PRIMARY_COLOR=${config.branding.primaryColor}
NEXT_PUBLIC_SECONDARY_COLOR=${config.branding.secondaryColor}
`;

      await fs.writeFile(
        path.join(this.options.targetPath, 'packages', 'frontend', '.env.local.example'),
        frontendEnvTemplate
      );
    }

    this.spinner.succeed('Environment templates created');
  }

  private async runEnvironmentSetup(): Promise<void> {
    const { EnvironmentSetup } = await import('./environment');
    const envSetup = new EnvironmentSetup(this.options.targetPath, this.options.config);
    
    await envSetup.setupEnvironment();
    this.showSuccessMessage();
  }

  private async initializeGit(): Promise<void> {
    this.spinner = ora('Initializing Git repository...').start();
    
    // Create .gitignore
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
.next/
build/

# Environment files
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Docker
.dockerignore

# Temporary folders
tmp/
temp/
`;

    await fs.writeFile(
      path.join(this.options.targetPath, '.gitignore'),
      gitignore
    );

    this.spinner.succeed('Git repository initialized');
  }

  private async generateTemplateFiles(): Promise<void> {
    this.spinner = ora('Generating template-specific files...').start();
    
    // Generate mock API for frontend-only templates
    if (this.options.config.template === 'frontend-only') {
      await this.templateProcessor.generateMockAPI(this.options.targetPath);
    }
    
    this.spinner.succeed('Template files generated');
  }

  private async generateDockerDeploymentScript(): Promise<void> {
    const { config } = this.options;
    
    const deployScript = `#!/bin/bash

# ${config.branding.organizationName} ICD-11 Application Deployment
set -e

echo "🏥 Deploying ${config.branding.organizationName} ICD-11 Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if environment files exist
if [ ! -f packages/backend/.env ]; then
    echo "⚠️  Backend environment file not found. Copying from example..."
    cp packages/backend/.env.example packages/backend/.env
    echo "✏️  Please configure WHO ICD-11 API credentials in packages/backend/.env"
fi

if [ ! -f packages/frontend/.env.local ]; then
    echo "⚠️  Frontend environment file not found. Copying from example..."
    cp packages/frontend/.env.local.example packages/frontend/.env.local
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🏥 Checking service health..."

# Check Redis
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Not responding"
fi

# Check backend
if curl -f http://localhost:3003/api/health > /dev/null 2>&1; then
    echo "✅ Backend API: Healthy"
else
    echo "⚠️  Backend API: Not responding (may need WHO credentials)"
fi

# Check frontend  
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo "📱 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:3003/api/docs"
echo "🔧 Redis: localhost:6379"
echo ""
echo "📋 Next steps:"
echo "  1. Configure WHO ICD-11 API credentials in packages/backend/.env"
echo "  2. Visit http://localhost:3000 to access ${config.branding.organizationName}"
echo "  3. Check logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  4. Stop services: docker-compose -f docker-compose.prod.yml down"
`;
    
    const dockerDir = path.join(this.options.targetPath, 'docker');
    await fs.ensureDir(dockerDir);
    
    await fs.writeFile(
      path.join(dockerDir, 'deploy.sh'),
      deployScript
    );
    
    await fs.chmod(path.join(dockerDir, 'deploy.sh'), 0o755);
  }

  private async copyFrontendOnly(sourceRoot: string): Promise<void> {
    await fs.copy(
      path.join(sourceRoot, 'packages', 'frontend'),
      path.join(this.options.targetPath, 'packages', 'frontend'),
      { filter: this.getFileFilter('frontend') }
    );
    
    await fs.copy(
      path.join(sourceRoot, 'packages', 'shared'),
      path.join(this.options.targetPath, 'packages', 'shared')
    );
  }

  private async copyBackendOnly(sourceRoot: string): Promise<void> {
    await fs.copy(
      path.join(sourceRoot, 'packages', 'backend'),
      path.join(this.options.targetPath, 'packages', 'backend'),
      { filter: this.getFileFilter('backend') }
    );
    
    await fs.copy(
      path.join(sourceRoot, 'packages', 'shared'),
      path.join(this.options.targetPath, 'packages', 'shared')
    );
  }

  private async copyMinimalTemplate(sourceRoot: string): Promise<void> {
    // Copy basic frontend without advanced features
    await this.copyFrontendOnly(sourceRoot);
    await this.copyBackendOnly(sourceRoot);
  }

  private async copyFullStack(sourceRoot: string): Promise<void> {
    // Copy all packages
    await fs.copy(
      path.join(sourceRoot, 'packages', 'frontend'),
      path.join(this.options.targetPath, 'packages', 'frontend'),
      { filter: this.getFileFilter('frontend') }
    );

    await fs.copy(
      path.join(sourceRoot, 'packages', 'backend'),
      path.join(this.options.targetPath, 'packages', 'backend'),
      { filter: this.getFileFilter('backend') }
    );

    await fs.copy(
      path.join(sourceRoot, 'packages', 'shared'),
      path.join(this.options.targetPath, 'packages', 'shared')
    );

    // Copy Docker files
    await fs.copy(
      path.join(sourceRoot, 'docker-compose.yml'),
      path.join(this.options.targetPath, 'docker-compose.yml')
    );
  }

  private getFileFilter(packageType: 'frontend' | 'backend') {
    return (src: string) => {
      const basename = path.basename(src);
      const excludes = [
        'node_modules', '.next', 'dist', '.env', '.env.local',
        'npm-debug.log', 'yarn-error.log', '.DS_Store'
      ];
      
      return !excludes.some(exclude => basename.includes(exclude));
    };
  }

  private async generateBrandingFiles(): Promise<void> {
    if (this.options.config.template === 'api-only') return;
    
    this.spinner = ora('Generating branding configuration...').start();
    
    const { branding } = this.options.config;
    
    // Create branding configuration file
    const brandingConfig = {
      organization: {
        name: branding.organizationName,
        website: branding.websiteUrl,
        support: branding.supportEmail
      },
      theme: {
        colors: {
          primary: branding.primaryColor,
          secondary: branding.secondaryColor
        }
      }
    };
    
    await fs.writeJson(
      path.join(this.options.targetPath, 'packages', 'frontend', 'config', 'branding.json'),
      brandingConfig,
      { spaces: 2 }
    );
    
    // Update Tailwind config with custom colors
    const tailwindConfigPath = path.join(this.options.targetPath, 'packages', 'frontend', 'tailwind.config.js');
    
    if (await fs.pathExists(tailwindConfigPath)) {
      let tailwindConfig = await fs.readFile(tailwindConfigPath, 'utf-8');
      
      // Insert custom colors into theme.extend.colors
      const customColors = `
        // Healthcare organization branding
        brand: {
          primary: '${branding.primaryColor}',
          secondary: '${branding.secondaryColor}'
        },`;
      
      tailwindConfig = tailwindConfig.replace(
        /colors:\s*\{/,
        `colors: {${customColors}`
      );
      
      await fs.writeFile(tailwindConfigPath, tailwindConfig);
    }
    
    this.spinner.succeed('Branding configuration created');
  }

  private async generateDeploymentFiles(): Promise<void> {
    const { deployment } = this.options.config;
    
    if (deployment.provider === 'none') return;
    
    this.spinner = ora(`Generating ${deployment.provider} deployment files...`).start();
    
    // Use template processor for cloud deployments
    await this.templateProcessor.generateCloudDeployment(this.options.targetPath);
    
    // Generate Docker deployment if needed
    if (deployment.provider === 'docker') {
      await this.templateProcessor.generateDockerCompose(this.options.targetPath);
      await this.generateDockerDeploymentScript();
    }
    
    // Generate CI/CD files using template processor
    if (deployment.enableCI && deployment.ciProvider) {
      await this.templateProcessor.generateCIPipeline(this.options.targetPath);
    }
    
    this.spinner.succeed(`${deployment.provider} deployment files created`);
  }

  private async generateDockerDeploymentLegacy(deploymentDir: string): Promise<void> {
    const { config } = this.options;
    
    // Enhanced docker-compose.yml
    const dockerCompose = `version: '3.8'

services:
  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3003/api
      - NEXT_PUBLIC_APP_NAME=${config.branding.organizationName}
    depends_on:
      - backend

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - ORG_NAME=${config.branding.organizationName}
    depends_on:
      - redis
    env_file:
      - ./packages/backend/.env

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
`;
    
    await fs.writeFile(
      path.join(deploymentDir, 'docker-compose.prod.yml'),
      dockerCompose
    );
    
    // Docker deployment script
    const deployScript = `#!/bin/bash

# ${config.branding.organizationName} ICD-11 Application Deployment

echo "Deploying ${config.branding.organizationName} ICD-11 Application..."

# Build and start services
docker-compose -f docker/docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service health
echo "Checking service health..."
docker-compose -f docker/docker-compose.prod.yml ps

echo "Deployment complete!"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:3003/api/docs"
`;
    
    await fs.writeFile(
      path.join(deploymentDir, 'deploy.sh'),
      deployScript
    );
    
    await fs.chmod(path.join(deploymentDir, 'deploy.sh'), 0o755);
  }

  private async generateAWSDeploymentLegacy(deploymentDir: string): Promise<void> {
    const { config } = this.options;
    
    // ECS Task Definition
    const ecsTaskDef = {
      family: `${this.options.projectName}-task`,
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      cpu: '512',
      memory: '1024',
      executionRoleArn: 'arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole',
      containerDefinitions: [
        {
          name: 'frontend',
          image: `${this.options.projectName}-frontend:latest`,
          portMappings: [{ containerPort: 3000, protocol: 'tcp' }],
          environment: [
            { name: 'NEXT_PUBLIC_APP_NAME', value: config.branding.organizationName }
          ]
        },
        {
          name: 'backend',
          image: `${this.options.projectName}-backend:latest`,
          portMappings: [{ containerPort: 3003, protocol: 'tcp' }],
          environment: [
            { name: 'ORG_NAME', value: config.branding.organizationName }
          ]
        }
      ]
    };
    
    await fs.writeJson(
      path.join(deploymentDir, 'task-definition.json'),
      ecsTaskDef,
      { spaces: 2 }
    );
    
    // CloudFormation template
    const cfTemplate = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: `${config.branding.organizationName} ICD-11 Healthcare Application`,
      Resources: {
        // VPC, ECS Cluster, Load Balancer, etc.
      }
    };
    
    await fs.writeJson(
      path.join(deploymentDir, 'cloudformation.json'),
      cfTemplate,
      { spaces: 2 }
    );
  }

  private async generateAzureDeploymentLegacy(deploymentDir: string): Promise<void> {
    const { config } = this.options;
    
    // Azure Container Apps configuration
    const containerAppConfig = {
      apiVersion: '2022-03-01',
      type: 'Microsoft.App/containerApps',
      name: this.options.projectName,
      location: '[parameters(\'location\')]',
      properties: {
        configuration: {
          ingress: {
            external: true,
            targetPort: 3000
          }
        },
        template: {
          containers: [
            {
              name: 'frontend',
              image: `${this.options.projectName}-frontend:latest`,
              env: [
                {
                  name: 'NEXT_PUBLIC_APP_NAME',
                  value: config.branding.organizationName
                }
              ]
            }
          ],
          scale: {
            minReplicas: 1,
            maxReplicas: 10
          }
        }
      }
    };
    
    await fs.writeJson(
      path.join(deploymentDir, 'container-app.json'),
      containerAppConfig,
      { spaces: 2 }
    );
  }

  private async generateGCPDeploymentLegacy(deploymentDir: string): Promise<void> {
    const { config } = this.options;
    
    // Cloud Run service configuration
    const cloudRunConfig = {
      apiVersion: 'serving.knative.dev/v1',
      kind: 'Service',
      metadata: {
        name: this.options.projectName,
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
            containers: [
              {
                image: `gcr.io/PROJECT_ID/${this.options.projectName}:latest`,
                env: [
                  {
                    name: 'NEXT_PUBLIC_APP_NAME',
                    value: config.branding.organizationName
                  }
                ]
              }
            ]
          }
        }
      }
    };
    
    await fs.writeJson(
      path.join(deploymentDir, 'cloud-run.yaml'),
      cloudRunConfig,
      { spaces: 2 }
    );
  }

  private async generateCIFilesLegacy(ciProvider: string): Promise<void> {
    const { config } = this.options;
    
    if (ciProvider === 'github-actions') {
      const workflowsDir = path.join(this.options.targetPath, '.github', 'workflows');
      await fs.ensureDir(workflowsDir);
      
      const workflow = `name: Deploy ${config.branding.organizationName} ICD-11 App

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm run install:all
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to ${config.deployment.provider}
      run: |
        echo "Deploying to ${config.deployment.provider}"
        # Add deployment commands here
`;
      
      await fs.writeFile(
        path.join(workflowsDir, 'deploy.yml'),
        workflow
      );
    } else if (ciProvider === 'gitlab-ci') {
      const gitlabCI = `stages:
  - test
  - build
  - deploy

variables:
  APP_NAME: "${config.branding.organizationName} ICD-11 App"

test:
  stage: test
  image: node:18
  before_script:
    - npm run install:all
  script:
    - npm run test
    - npm run build

deploy:
  stage: deploy
  image: node:18
  script:
    - echo "Deploying $APP_NAME to ${config.deployment.provider}"
    # Add deployment commands here
  only:
    - main
`;
      
      await fs.writeFile(
        path.join(this.options.targetPath, '.gitlab-ci.yml'),
        gitlabCI
      );
    }
  }

  private showSuccessMessage(): void {
    const { projectName, targetPath, config } = this.options;
    const { branding, deployment, redis } = config;
    
    console.log(chalk.green('\n🎉 Success! Created ICD-11 healthcare application'));
    console.log(chalk.cyan(`\n🏥 Organization: ${branding.organizationName}`));
    console.log(`📁 Project created in: ${chalk.cyan(targetPath)}`);
    
    console.log(chalk.yellow('\n📋 Quick Start:'));
    console.log(`  1. ${chalk.cyan(`cd ${projectName}`)}`);
    
    if (config.template !== 'frontend-only') {
      console.log(`  2. ${chalk.cyan('cp packages/backend/.env.example packages/backend/.env')}`);
    }
    
    if (config.template !== 'api-only') {
      console.log(`  ${config.template !== 'frontend-only' ? '3' : '2'}. ${chalk.cyan('cp packages/frontend/.env.local.example packages/frontend/.env.local')}`);
    }
    
    let stepNumber = config.template === 'frontend-only' ? 3 : config.template === 'api-only' ? 3 : 4;
    
    if (!config.whoCredentials && config.template !== 'frontend-only') {
      console.log(`  ${stepNumber++}. Add your WHO ICD-11 API credentials to packages/backend/.env`);
    }
    
    if (redis.useDocker && config.template !== 'frontend-only') {
      console.log(`  ${stepNumber++}. ${chalk.cyan('docker run -d -p 6379:6379 redis')} (Start Redis)`);
    }
    
    if (!config.installDependencies) {
      console.log(`  ${stepNumber++}. ${chalk.cyan('npm run install:all')}`);
    }
    
    console.log(`  ${stepNumber++}. ${chalk.cyan('npm run dev')}`);
    
    if (deployment.provider !== 'none' && deployment.provider !== 'docker') {
      console.log(`  ${stepNumber++}. Check deployment files in ./${deployment.provider}/ directory`);
    }
    
    console.log(chalk.yellow('\n🌍 Access Points:'));
    if (config.template !== 'api-only') {
      console.log(`  • Frontend: ${chalk.cyan('http://localhost:3000')}`);
    }
    if (config.template !== 'frontend-only') {
      console.log(`  • API Docs: ${chalk.cyan('http://localhost:3003/api/docs')}`);
    }
    
    console.log(chalk.yellow('\n🔐 Healthcare Setup:'));
    if (!config.whoCredentials && config.template !== 'frontend-only') {
      console.log('  • WHO ICD-11 API: https://icd.who.int/icdapi (Get credentials)');
    } else if (config.whoCredentials) {
      console.log(`  • WHO ICD-11 API: ${chalk.green('Credentials configured ✓')}`);
    }
    
    if (config.template !== 'frontend-only') {
      console.log(`  • Redis Cache: ${redis.useDocker ? 'Docker container' : `${redis.host}:${redis.port}`}`);
    }
    
    if (branding.websiteUrl) {
      console.log(`  • Organization: ${chalk.cyan(branding.websiteUrl)}`);
    }
    
    if (branding.supportEmail) {
      console.log(`  • Support: ${chalk.cyan(branding.supportEmail)}`);
    }
    
    console.log(chalk.green(`\n✨ ${branding.organizationName} ICD-11 application is ready!`));
  }
}