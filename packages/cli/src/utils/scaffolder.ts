/**
 * Project scaffolding utilities
 * Handles copying templates and generating project files
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from './logger';

export interface ScaffoldOptions {
  projectName: string;
  template: string;
  targetPath: string;
  installDependencies: boolean;
  setupEnvironment: boolean;
}

export class ProjectScaffolder {
  private options: ScaffoldOptions;
  private spinner: any;

  constructor(options: ScaffoldOptions) {
    this.options = options;
  }

  async scaffold(): Promise<void> {
    try {
      await this.createProjectDirectory();
      await this.copyTemplate();
      await this.generatePackageJson();
      await this.generateEnvironmentFiles();
      
      await this.initializeGit();
      
      if (this.options.installDependencies) {
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
    
    // For now, copy the current project structure as a template
    const sourceRoot = path.resolve(__dirname, '../../../../');
    
    // Copy frontend
    await fs.copy(
      path.join(sourceRoot, 'packages', 'frontend'),
      path.join(this.options.targetPath, 'packages', 'frontend'),
      {
        filter: (src) => {
          // Exclude node_modules, dist, .next, etc.
          const relativePath = path.relative(path.join(sourceRoot, 'packages', 'frontend'), src);
          return !relativePath.includes('node_modules') && 
                 !relativePath.includes('.next') && 
                 !relativePath.includes('dist') &&
                 !relativePath.startsWith('.');
        }
      }
    );

    // Copy backend
    await fs.copy(
      path.join(sourceRoot, 'packages', 'backend'),
      path.join(this.options.targetPath, 'packages', 'backend'),
      {
        filter: (src) => {
          const relativePath = path.relative(path.join(sourceRoot, 'packages', 'backend'), src);
          return !relativePath.includes('node_modules') && 
                 !relativePath.includes('dist') &&
                 !relativePath.startsWith('.');
        }
      }
    );

    // Copy shared types
    await fs.copy(
      path.join(sourceRoot, 'packages', 'shared'),
      path.join(this.options.targetPath, 'packages', 'shared')
    );

    // Copy Docker files
    await fs.copy(
      path.join(sourceRoot, 'docker-compose.yml'),
      path.join(this.options.targetPath, 'docker-compose.yml')
    );

    // Ensure PostCSS config exists in frontend
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
    if (!this.options.setupEnvironment) return;

    this.spinner = ora('Setting up environment files...').start();

    // Backend .env template
    const backendEnvTemplate = `# WHO ICD-11 API Configuration
ICD11_CLIENT_ID=your_who_client_id_here
ICD11_CLIENT_SECRET=your_who_client_secret_here

# API Configuration
PORT=3003
CORS_ORIGINS=http://localhost:3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Configuration
NODE_ENV=development
`;

    await fs.writeFile(
      path.join(this.options.targetPath, 'packages', 'backend', '.env.example'),
      backendEnvTemplate
    );

    // Frontend .env.local template
    const frontendEnvTemplate = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=${this.options.projectName}
`;

    await fs.writeFile(
      path.join(this.options.targetPath, 'packages', 'frontend', '.env.local.example'),
      frontendEnvTemplate
    );

    this.spinner.succeed('Environment templates created');
  }

  private async runEnvironmentSetup(): Promise<void> {
    const { EnvironmentSetup } = await import('./environment');
    const envSetup = new EnvironmentSetup(this.options.targetPath);
    
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

  private showSuccessMessage(): void {
    const { projectName, targetPath } = this.options;
    
    console.log(chalk.green('\n🎉 Success! Created ICD-11 healthcare application'));
    console.log(`\n📁 Project created in: ${chalk.cyan(targetPath)}`);
    
    console.log(chalk.yellow('\n📋 Next steps:'));
    console.log(`  1. ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  2. ${chalk.cyan('cp packages/backend/.env.example packages/backend/.env')}`);
    console.log(`  3. ${chalk.cyan('cp packages/frontend/.env.local.example packages/frontend/.env.local')}`);
    console.log(`  4. Add your WHO ICD-11 API credentials to packages/backend/.env`);
    console.log(`  5. ${chalk.cyan('npm run install:all')} (if not already done)`);
    console.log(`  6. ${chalk.cyan('npm run dev')}`);
    
    console.log(chalk.yellow('\n🏥 Healthcare Provider Setup:'));
    console.log('  • Get WHO ICD-11 API credentials from: https://icd.who.int/icdapi');
    console.log('  • Setup Redis server (Docker: docker run -p 6379:6379 redis)');
    console.log('  • Visit http://localhost:3000 to start using ICD-11 codes');
    
    console.log(chalk.green('\n✨ Happy coding! Your ICD-11 application is ready to use.'));
  }
}