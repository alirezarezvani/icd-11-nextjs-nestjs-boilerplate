/**
 * Create command implementation
 * Handles project creation with validation and user prompts
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';
import { validateProjectName, validateDirectory } from '../utils/validation';
import { logger } from '../utils/logger';

export interface CreateOptions {
  template?: string;
  yes?: boolean;
  verbose?: boolean;
}

export interface BrandingConfig {
  organizationName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
}

export interface DeploymentConfig {
  provider: 'docker' | 'aws' | 'azure' | 'gcp' | 'none';
  enableCI: boolean;
  ciProvider?: 'github-actions' | 'gitlab-ci' | 'none';
}

export interface ProjectConfig {
  template: string;
  installDependencies: boolean;
  setupEnvironment: boolean;
  branding: BrandingConfig;
  deployment: DeploymentConfig;
  whoCredentials?: {
    clientId?: string;
    clientSecret?: string;
  };
  redis: {
    useDocker: boolean;
    host: string;
    port: number;
  };
}

export async function createApp(projectName: string | undefined, options: CreateOptions): Promise<void> {
  logger.setVerbose(options.verbose || false);
  
  console.log(chalk.blue.bold('\n🏥 ICD-11 Healthcare Application Creator\n'));

  // Get project name if not provided
  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: (input: string) => {
          const validation = validateProjectName(input);
          return validation.isValid || validation.error || 'Please enter a valid project name';
        }
      }
    ]);
    projectName = answers.projectName;
  }

  // Validate project name
  const nameValidation = validateProjectName(projectName!);
  if (!nameValidation.isValid) {
    console.error(chalk.red('Error:'), nameValidation.error);
    process.exit(1);
  }

  // Validate directory doesn't exist
  const dirValidation = validateDirectory(projectName!);
  if (!dirValidation.isValid) {
    if (!options.yes) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory "${projectName}" already exists. Continue anyway?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
      }
    }
  }

  // Get comprehensive configuration
  let config: ProjectConfig = {
    template: options.template || 'default',
    installDependencies: true,
    setupEnvironment: true,
    branding: {
      organizationName: projectName!.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') + ' Healthcare',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e'
    },
    deployment: {
      provider: 'docker',
      enableCI: false
    },
    redis: {
      useDocker: true,
      host: 'localhost',
      port: 6379
    }
  };

  if (!options.yes) {
    console.log(chalk.blue('\n🏥 Healthcare Application Configuration\n'));
    
    // Template selection
    const templateAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          { name: 'Full Stack (Next.js + NestJS + Redis + Docker)', value: 'default' },
          { name: 'Frontend Only (Next.js + shadcn/ui)', value: 'frontend-only' },
          { name: 'API Only (NestJS + Redis)', value: 'api-only' },
          { name: 'Minimal (Basic Next.js + NestJS)', value: 'minimal' }
        ],
        default: 'default'
      }
    ]);
    
    config.template = templateAnswers.template;
    
    // Healthcare provider branding
    console.log(chalk.yellow('\n🎨 Healthcare Provider Branding'));
    const brandingAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'organizationName',
        message: 'Healthcare organization name:',
        default: config.branding.organizationName,
        validate: (input: string) => input.length > 0 || 'Organization name is required'
      },
      {
        type: 'input',
        name: 'primaryColor',
        message: 'Primary brand color (hex):',
        default: config.branding.primaryColor,
        validate: (input: string) => {
          const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          return hexRegex.test(input) || 'Please enter a valid hex color (e.g., #1976d2)';
        }
      },
      {
        type: 'input',
        name: 'secondaryColor',
        message: 'Secondary brand color (hex):',
        default: config.branding.secondaryColor,
        validate: (input: string) => {
          const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          return hexRegex.test(input) || 'Please enter a valid hex color (e.g., #dc004e)';
        }
      },
      {
        type: 'input',
        name: 'websiteUrl',
        message: 'Organization website URL (optional):',
        validate: (input: string) => {
          if (!input) return true;
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL or leave empty';
          }
        }
      },
      {
        type: 'input',
        name: 'supportEmail',
        message: 'Support email (optional):',
        validate: (input: string) => {
          if (!input) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || 'Please enter a valid email or leave empty';
        }
      }
    ]);
    
    config.branding = { ...config.branding, ...brandingAnswers };
    
    // WHO API credentials configuration
    console.log(chalk.yellow('\n🔐 WHO ICD-11 API Configuration'));
    const whoAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureNow',
        message: 'Do you want to configure WHO ICD-11 API credentials now?',
        default: false
      }
    ]);
    
    if (whoAnswers.configureNow) {
      const credentialsAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'clientId',
          message: 'WHO ICD-11 Client ID:',
          validate: (input: string) => input.length > 0 || 'Client ID is required'
        },
        {
          type: 'password',
          name: 'clientSecret',
          message: 'WHO ICD-11 Client Secret:',
          validate: (input: string) => input.length > 0 || 'Client Secret is required'
        }
      ]);
      
      config.whoCredentials = credentialsAnswers;
    }
    
    // Redis configuration
    console.log(chalk.yellow('\n🗄️  Redis Cache Configuration'));
    const redisAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'redisSetup',
        message: 'How would you like to setup Redis?',
        choices: [
          { name: 'Docker (Recommended - automatic setup)', value: 'docker' },
          { name: 'Local Redis server', value: 'local' },
          { name: 'Skip Redis setup (configure later)', value: 'skip' }
        ],
        default: 'docker'
      }
    ]);
    
    if (redisAnswers.redisSetup === 'docker') {
      config.redis.useDocker = true;
    } else if (redisAnswers.redisSetup === 'local') {
      const localRedisAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'host',
          message: 'Redis host:',
          default: 'localhost'
        },
        {
          type: 'number',
          name: 'port',
          message: 'Redis port:',
          default: 6379
        }
      ]);
      
      config.redis = {
        useDocker: false,
        ...localRedisAnswers
      };
    }
    
    // Deployment configuration
    console.log(chalk.yellow('\n🚀 Deployment Configuration'));
    const deploymentAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Which deployment method would you like to setup?',
        choices: [
          { name: 'Docker Compose (Local/Server)', value: 'docker' },
          { name: 'AWS (ECS/Lambda)', value: 'aws' },
          { name: 'Azure (Container Apps)', value: 'azure' },
          { name: 'Google Cloud (Cloud Run)', value: 'gcp' },
          { name: 'Skip deployment setup', value: 'none' }
        ],
        default: 'docker'
      }
    ]);
    
    config.deployment.provider = deploymentAnswers.provider;
    
    if (deploymentAnswers.provider !== 'none') {
      const ciAnswers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'enableCI',
          message: 'Setup CI/CD pipeline?',
          default: true
        }
      ]);
      
      config.deployment.enableCI = ciAnswers.enableCI;
      
      if (ciAnswers.enableCI) {
        const ciProviderAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'ciProvider',
            message: 'Which CI/CD provider?',
            choices: [
              { name: 'GitHub Actions', value: 'github-actions' },
              { name: 'GitLab CI', value: 'gitlab-ci' }
            ],
            default: 'github-actions'
          }
        ]);
        
        config.deployment.ciProvider = ciProviderAnswers.ciProvider;
      }
    }
    
    // Final configuration
    const finalAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Install dependencies automatically?',
        default: true
      },
      {
        type: 'confirm',
        name: 'setupEnvironment',
        message: 'Setup environment files with your configuration?',
        default: true
      }
    ]);
    
    config.installDependencies = finalAnswers.installDependencies;
    config.setupEnvironment = finalAnswers.setupEnvironment;
  }

  console.log(chalk.green(`\n✅ Creating ICD-11 healthcare application: ${projectName}`));
  console.log(chalk.dim(`   Organization: ${config.branding.organizationName}`));
  console.log(chalk.dim(`   Template: ${config.template}`));
  console.log(chalk.dim(`   Primary Color: ${config.branding.primaryColor}`));
  console.log(chalk.dim(`   Deployment: ${config.deployment.provider}`));
  console.log(chalk.dim(`   Redis Setup: ${config.redis.useDocker ? 'Docker' : 'Local'}`));
  console.log(chalk.dim(`   Install dependencies: ${config.installDependencies ? 'Yes' : 'No'}`));
  console.log(chalk.dim(`   Setup environment: ${config.setupEnvironment ? 'Yes' : 'No'}\n`));

  // Create the project using scaffolder
  const { ProjectScaffolder } = await import('../utils/scaffolder');
  const targetPath = path.resolve(process.cwd(), projectName!);
  
  const scaffolder = new ProjectScaffolder({
    projectName: projectName!,
    targetPath,
    config
  });

  await scaffolder.scaffold();
}