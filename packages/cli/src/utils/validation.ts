/**
 * Validation utilities for CLI inputs
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import validateNpmPackageName from 'validate-npm-package-name';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate project name according to npm package naming rules
 */
export function validateProjectName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Project name cannot be empty'
    };
  }

  // Use npm package name validation
  const npmValidation = validateNpmPackageName(name);
  
  if (!npmValidation.validForNewPackages) {
    const errors = [
      ...(npmValidation.errors || []),
      ...(npmValidation.warnings || [])
    ];
    
    return {
      isValid: false,
      error: `Invalid project name: ${errors.join(', ')}`
    };
  }

  // Additional healthcare-specific validations
  const forbiddenNames = ['icd11', 'who', 'medical', 'health', 'healthcare'];
  if (forbiddenNames.some(forbidden => name.toLowerCase().includes(forbidden))) {
    // This is just a warning, not a hard error
    console.warn(`⚠️  Project name contains reserved healthcare terms. Consider using a more specific name.`);
  }

  return { isValid: true };
}

/**
 * Validate target directory
 */
export function validateDirectory(projectName: string): ValidationResult {
  const targetPath = path.resolve(process.cwd(), projectName);
  
  if (fs.existsSync(targetPath)) {
    const stats = fs.statSync(targetPath);
    
    if (!stats.isDirectory()) {
      return {
        isValid: false,
        error: `"${projectName}" exists and is not a directory`
      };
    }
    
    // Check if directory has contents
    const contents = fs.readdirSync(targetPath);
    if (contents.length > 0) {
      return {
        isValid: false,
        error: `Directory "${projectName}" is not empty`
      };
    }
  }

  // Check write permissions
  const parentDir = path.dirname(targetPath);
  try {
    fs.accessSync(parentDir, fs.constants.W_OK);
  } catch (error) {
    return {
      isValid: false,
      error: `No write permission in directory: ${parentDir}`
    };
  }

  return { isValid: true };
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): ValidationResult {
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  
  if (majorVersion < 16) {
    return {
      isValid: false,
      error: `Node.js 16 or higher is required. Current version: ${nodeVersion}`
    };
  }

  return { isValid: true };
}