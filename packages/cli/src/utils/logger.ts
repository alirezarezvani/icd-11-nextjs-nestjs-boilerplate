/**
 * Logging utility for CLI
 */

import chalk from 'chalk';

class Logger {
  private verbose = false;

  setVerbose(isVerbose: boolean): void {
    this.verbose = isVerbose;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✅'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠️'), message);
  }

  error(message: string, error?: any): void {
    console.log(chalk.red('❌'), message);
    if (error && this.verbose) {
      console.log(chalk.gray('Details:'), chalk.dim(error instanceof Error ? error.message : String(error)));
    }
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), chalk.dim(message));
    }
  }

  step(message: string): void {
    console.log(chalk.cyan('→'), message);
  }
}

export const logger = new Logger();