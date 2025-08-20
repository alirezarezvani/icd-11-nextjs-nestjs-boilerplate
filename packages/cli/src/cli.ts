#!/usr/bin/env node

/**
 * CLI entry point for create-icd11-app
 * Handles command parsing and execution
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createApp } from './commands/create';

const program = new Command();

// CLI Configuration
program
  .name('create-icd11-app')
  .description('Create a new ICD-11 healthcare application')
  .version('1.0.0');

// Main create command
program
  .argument('[project-name]', 'name of the project to create')
  .option('-t, --template <template>', 'template to use', 'default')
  .option('-y, --yes', 'skip prompts and use defaults')
  .option('--verbose', 'enable verbose logging')
  .action(async (projectName: string, options) => {
    try {
      await createApp(projectName, options);
    } catch (error) {
      console.error(chalk.red('Error creating application:'), error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

export { program };