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

  // Get additional configuration if not in --yes mode
  let config = {
    template: options.template || 'default',
    installDependencies: true,
    setupEnvironment: true
  };

  if (!options.yes) {
    const configAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          { name: 'Default (Next.js + NestJS + shadcn/ui)', value: 'default' },
          { name: 'Frontend Only (Next.js + shadcn/ui)', value: 'frontend-only' },
          { name: 'API Only (NestJS)', value: 'api-only' }
        ],
        default: 'default'
      },
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Install dependencies automatically?',
        default: true
      },
      {
        type: 'confirm',
        name: 'setupEnvironment',
        message: 'Setup environment files with examples?',
        default: true
      }
    ]);
    
    config = { ...config, ...configAnswers };
  }

  console.log(chalk.green(`\n✅ Creating ICD-11 application: ${projectName}`));
  console.log(chalk.dim(`   Template: ${config.template}`));
  console.log(chalk.dim(`   Install dependencies: ${config.installDependencies ? 'Yes' : 'No'}`));
  console.log(chalk.dim(`   Setup environment: ${config.setupEnvironment ? 'Yes' : 'No'}\n`));

  // Create the project using scaffolder
  const { ProjectScaffolder } = await import('../utils/scaffolder');
  const targetPath = path.resolve(process.cwd(), projectName!);
  
  const scaffolder = new ProjectScaffolder({
    projectName: projectName!,
    template: config.template,
    targetPath,
    installDependencies: config.installDependencies,
    setupEnvironment: config.setupEnvironment
  });

  await scaffolder.scaffold();
}