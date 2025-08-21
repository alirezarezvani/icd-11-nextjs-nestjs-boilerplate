/**
 * Environment setup and validation utilities
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ProjectConfig } from '../commands/create';

const execAsync = promisify(exec);

export interface EnvironmentCheckResult {
  success: boolean;
  message: string;
  details?: string;
}

export class EnvironmentSetup {
  private projectPath: string;
  private config: ProjectConfig;
  private spinner: any;

  constructor(projectPath: string, config: ProjectConfig) {
    this.projectPath = projectPath;
    this.config = config;
  }

  async setupEnvironment(): Promise<void> {
    console.log(chalk.blue('\n🔧 Setting up development environment...\n'));

    await this.checkNodeVersion();
    await this.checkNpmVersion();
    
    if (this.config.redis.useDocker && this.config.template !== 'frontend-only') {
      await this.setupRedisDocker();
    }
    
    await this.installDependencies();
    await this.setupEnvironmentFiles();
    await this.validateServices();

    console.log(chalk.green('\n✅ Environment setup completed successfully!'));
  }

  private async checkNodeVersion(): Promise<void> {
    this.spinner = ora('Checking Node.js version...').start();

    try {
      const { stdout } = await execAsync('node --version');
      const nodeVersion = stdout.trim();
      const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);

      if (majorVersion < 16) {
        this.spinner.fail(`Node.js 16+ required. Found: ${nodeVersion}`);
        throw new Error(`Please upgrade Node.js to version 16 or higher`);
      }

      this.spinner.succeed(`Node.js version: ${nodeVersion} ✅`);
    } catch (error) {
      this.spinner.fail('Node.js version check failed');
      throw error;
    }
  }

  private async checkNpmVersion(): Promise<void> {
    this.spinner = ora('Checking npm version...').start();

    try {
      const { stdout } = await execAsync('npm --version');
      const npmVersion = stdout.trim();
      const majorVersion = parseInt(npmVersion.split('.')[0]);

      if (majorVersion < 8) {
        this.spinner.warn(`npm 8+ recommended. Found: ${npmVersion}`);
      } else {
        this.spinner.succeed(`npm version: ${npmVersion} ✅`);
      }
    } catch (error) {
      this.spinner.fail('npm version check failed');
      throw error;
    }
  }

  private async installDependencies(): Promise<void> {
    this.spinner = ora('Installing dependencies... (this may take several minutes)').start();

    try {
      // Install root dependencies
      await execAsync('npm install', {
        cwd: this.projectPath,
        env: { ...process.env, NODE_ENV: 'development' }
      });

      // Install workspace dependencies
      await execAsync('npm install --workspaces', {
        cwd: this.projectPath,
        env: { ...process.env, NODE_ENV: 'development' }
      });

      this.spinner.succeed('Dependencies installed ✅');
    } catch (error) {
      this.spinner.fail('Dependency installation failed');
      
      console.log(chalk.yellow('\n⚠️  Dependency installation failed. You can install them manually:'));
      console.log(chalk.cyan('  cd ' + path.basename(this.projectPath)));
      console.log(chalk.cyan('  npm run install:all'));
      
      // Don't throw error, allow setup to continue
    }
  }

  private async setupEnvironmentFiles(): Promise<void> {
    this.spinner = ora('Configuring environment files...').start();

    try {
      // Copy backend .env.example to .env
      const backendEnvExample = path.join(this.projectPath, 'packages', 'backend', '.env.example');
      const backendEnv = path.join(this.projectPath, 'packages', 'backend', '.env');

      if (await fs.pathExists(backendEnvExample)) {
        await fs.copy(backendEnvExample, backendEnv);
      }

      // Copy frontend .env.local.example to .env.local
      const frontendEnvExample = path.join(this.projectPath, 'packages', 'frontend', '.env.local.example');
      const frontendEnv = path.join(this.projectPath, 'packages', 'frontend', '.env.local');

      if (await fs.pathExists(frontendEnvExample)) {
        await fs.copy(frontendEnvExample, frontendEnv);
      }

      this.spinner.succeed('Environment files configured ✅');
    } catch (error) {
      this.spinner.fail('Environment file setup failed');
      throw error;
    }
  }

  private async validateServices(): Promise<void> {
    console.log(chalk.blue('\n🔍 Validating external services...\n'));

    const results = await Promise.allSettled([
      this.checkRedisConnection(),
      this.checkWHOApiAccess()
    ]);

    results.forEach((result, index) => {
      const serviceName = index === 0 ? 'Redis' : 'WHO ICD-11 API';
      
      if (result.status === 'fulfilled' && result.value.success) {
        console.log(chalk.green(`✅ ${serviceName}: ${result.value.message}`));
      } else {
        const error = result.status === 'rejected' ? result.reason : result.value;
        console.log(chalk.yellow(`⚠️  ${serviceName}: ${error.message || 'Connection failed'}`));
        
        if (error.details) {
          console.log(chalk.dim(`   ${error.details}`));
        }
      }
    });

    this.showPostInstallInstructions();
  }

  private async setupRedisDocker(): Promise<void> {
    this.spinner = ora('Setting up Redis with Docker...').start();
    
    try {
      // Check if Docker is available
      await execAsync('docker --version');
      
      // Check if Redis container already exists
      const { stdout: containers } = await execAsync('docker ps -a --filter name=redis --format "{{.Names}}"');
      
      if (containers.includes('redis')) {
        this.spinner.info('Redis container already exists, starting it...');
        await execAsync('docker start redis');
      } else {
        this.spinner.text = 'Creating Redis container...';
        await execAsync('docker run -d --name redis -p 6379:6379 redis:7-alpine redis-server --appendonly yes');
      }
      
      // Wait a moment for Redis to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test connection
      await execAsync('docker exec redis redis-cli ping');
      
      this.spinner.succeed('Redis Docker container ready ✅');
    } catch (error) {
      this.spinner.warn('Docker Redis setup failed, you can set it up manually');
      console.log(chalk.yellow('   Manual setup: docker run -d --name redis -p 6379:6379 redis:7-alpine'));
    }
  }

  private async checkRedisConnection(): Promise<EnvironmentCheckResult> {
    try {
      // Try to connect to Redis on default port
      const { stdout } = await execAsync('redis-cli ping', { timeout: 3000 });
      
      if (stdout.trim().toUpperCase() === 'PONG') {
        return {
          success: true,
          message: 'Connected successfully'
        };
      } else {
        return {
          success: false,
          message: 'Redis not responding',
          details: 'Start Redis: docker run -p 6379:6379 redis'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Redis not available',
        details: 'Install Redis or start with Docker: docker run -p 6379:6379 redis'
      };
    }
  }

  private async checkWHOApiAccess(): Promise<EnvironmentCheckResult> {
    try {
      // Read the environment file to check if credentials are configured
      const envPath = path.join(this.projectPath, 'packages', 'backend', '.env');
      
      if (!(await fs.pathExists(envPath))) {
        return {
          success: false,
          message: 'Environment file not found',
          details: 'Configure WHO API credentials in packages/backend/.env'
        };
      }

      const envContent = await fs.readFile(envPath, 'utf-8');
      const hasClientId = envContent.includes('ICD11_CLIENT_ID=') && 
                         !envContent.includes('your_who_client_id_here') && 
                         envContent.match(/ICD11_CLIENT_ID=\S+/);
      const hasClientSecret = envContent.includes('ICD11_CLIENT_SECRET=') && 
                            !envContent.includes('your_who_client_secret_here') && 
                            envContent.match(/ICD11_CLIENT_SECRET=\S+/);

      if (!hasClientId || !hasClientSecret) {
        // Check if credentials were provided during setup
        if (this.config.whoCredentials) {
          return {
            success: true,
            message: 'Credentials configured during setup'
          };
        }
        
        return {
          success: false,
          message: 'WHO API credentials not configured',
          details: 'Get credentials from https://icd.who.int/icdapi and update packages/backend/.env'
        };
      }

      return {
        success: true,
        message: 'Credentials configured (not validated)'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Configuration check failed',
        details: 'Ensure WHO API credentials are properly set in packages/backend/.env'
      };
    }
  }

  private showPostInstallInstructions(): void {
    const { branding, deployment, template, whoCredentials, redis } = this.config;
    
    console.log(chalk.blue(`\n📋 ${branding.organizationName} Setup Complete:\n`));

    if (!whoCredentials && template !== 'frontend-only') {
      console.log('1. 🔐 Configure WHO ICD-11 API Credentials:');
      console.log(chalk.dim('   • Visit: https://icd.who.int/icdapi'));
      console.log(chalk.dim('   • Register and get your Client ID and Secret'));
      console.log(chalk.dim('   • Update: packages/backend/.env'));
    } else if (whoCredentials) {
      console.log(chalk.green('✅ WHO ICD-11 API Credentials: Configured'));
    }

    if (template !== 'frontend-only') {
      if (redis.useDocker) {
        console.log(chalk.green('✅ Redis Server: Docker container configured'));
      } else {
        console.log(`\n🗄️  Redis Server: ${redis.host}:${redis.port}`);
        console.log(chalk.dim('   • Ensure Redis is running on the configured host/port'));
      }
    }

    console.log('\n🚀 Development Commands:');
    console.log(chalk.cyan(`   cd ${path.basename(this.projectPath)}`));
    console.log(chalk.cyan('   npm run dev'));

    console.log('\n🌐 Access Points:');
    if (template !== 'api-only') {
      console.log(chalk.dim('   • Frontend: http://localhost:3000'));
    }
    if (template !== 'frontend-only') {
      console.log(chalk.dim('   • API Docs: http://localhost:3003/api/docs'));
    }
    
    if (deployment.provider !== 'none') {
      console.log('\n🚢 Deployment:');
      console.log(chalk.dim(`   • Provider: ${deployment.provider}`));
      console.log(chalk.dim(`   • Files: ./${deployment.provider}/ directory`));
      
      if (deployment.enableCI) {
        console.log(chalk.dim(`   • CI/CD: ${deployment.ciProvider} pipeline configured`));
      }
    }
    
    if (branding.websiteUrl) {
      console.log(`\n🌐 Organization: ${chalk.cyan(branding.websiteUrl)}`);
    }
    
    if (branding.supportEmail) {
      console.log(`📧 Support: ${chalk.cyan(branding.supportEmail)}`);
    }

    console.log(chalk.green(`\n🎉 ${branding.organizationName} ICD-11 Healthcare Application is ready!`));
  }
}