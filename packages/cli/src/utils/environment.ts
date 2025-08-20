/**
 * Environment setup and validation utilities
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface EnvironmentCheckResult {
  success: boolean;
  message: string;
  details?: string;
}

export class EnvironmentSetup {
  private projectPath: string;
  private spinner: any;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async setupEnvironment(): Promise<void> {
    console.log(chalk.blue('\n🔧 Setting up development environment...\n'));

    await this.checkNodeVersion();
    await this.checkNpmVersion();
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
      const hasClientId = envContent.includes('ICD11_CLIENT_ID=') && !envContent.includes('your_who_client_id_here');
      const hasClientSecret = envContent.includes('ICD11_CLIENT_SECRET=') && !envContent.includes('your_who_client_secret_here');

      if (!hasClientId || !hasClientSecret) {
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
    console.log(chalk.blue('\n📋 Next Steps for Healthcare Providers:\n'));

    console.log('1. 🔐 Configure WHO ICD-11 API Credentials:');
    console.log(chalk.dim('   • Visit: https://icd.who.int/icdapi'));
    console.log(chalk.dim('   • Register and get your Client ID and Secret'));
    console.log(chalk.dim(`   • Update: packages/backend/.env`));

    console.log('\n2. 🗄️  Start Redis Server:');
    console.log(chalk.dim('   • Docker: docker run -d -p 6379:6379 redis'));
    console.log(chalk.dim('   • Or install locally: https://redis.io/download'));

    console.log('\n3. 🚀 Start Development:');
    console.log(chalk.cyan(`   cd ${path.basename(this.projectPath)}`));
    console.log(chalk.cyan('   npm run dev'));

    console.log('\n4. 🌐 Access Your Application:');
    console.log(chalk.dim('   • Frontend: http://localhost:3000'));
    console.log(chalk.dim('   • API Docs: http://localhost:3003/api/docs'));

    console.log(chalk.green('\n🎉 Your ICD-11 Healthcare Application is ready!'));
  }
}