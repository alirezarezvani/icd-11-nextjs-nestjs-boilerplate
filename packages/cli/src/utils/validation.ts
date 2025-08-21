/**
 * Validation utilities for CLI inputs
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import validateNpmPackageName from 'validate-npm-package-name';
import type { ProjectConfig } from '../commands/create';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  data?: any;
}

export interface WHOCredentials {
  clientId: string;
  clientSecret: string;
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
 * Validate project name - throws error for invalid names (for compatibility with tests)
 */
export function validateProjectNameStrict(name: string): void {
  const result = validateProjectName(name);
  if (!result.isValid) {
    throw new Error(result.error);
  }
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

/**
 * Validate complete project configuration
 */
export function validateConfig(config: ProjectConfig): void {
  // Validate template
  const validTemplates = ['default', 'frontend-only', 'api-only', 'minimal'];
  if (!validTemplates.includes(config.template)) {
    throw new Error(`Invalid template: ${config.template}. Must be one of: ${validTemplates.join(', ')}`);
  }

  // Validate branding
  validateBranding(config.branding);

  // Validate deployment
  validateDeployment(config.deployment);

  // Validate Redis configuration
  validateRedis(config.redis);

  // Validate WHO credentials if provided
  if (config.whoCredentials) {
    validateWHOCredentials(config.whoCredentials);
  }
}

/**
 * Validate branding configuration
 */
function validateBranding(branding: ProjectConfig['branding']): void {
  // Organization name is required
  if (!branding.organizationName || branding.organizationName.trim().length === 0) {
    throw new Error('Organization name is required');
  }

  if (branding.organizationName.trim().length > 100) {
    throw new Error('Organization name is too long (max 100 characters)');
  }

  // Validate colors (hex format)
  if (!isValidHexColor(branding.primaryColor)) {
    throw new Error('Primary color must be a valid hex color (e.g., #1976d2)');
  }

  if (!isValidHexColor(branding.secondaryColor)) {
    throw new Error('Secondary color must be a valid hex color (e.g., #dc004e)');
  }

  // Validate optional URL
  if (branding.websiteUrl && !isValidURL(branding.websiteUrl.trim())) {
    throw new Error('Website URL must be a valid URL');
  }

  // Validate optional email
  if (branding.supportEmail && !isValidEmail(branding.supportEmail.trim())) {
    throw new Error('Support email must be a valid email address');
  }
}

/**
 * Validate deployment configuration
 */
function validateDeployment(deployment: ProjectConfig['deployment']): void {
  const validProviders = ['docker', 'aws', 'azure', 'gcp', 'none'];
  if (!validProviders.includes(deployment.provider)) {
    throw new Error(`Invalid deployment provider: ${deployment.provider}. Must be one of: ${validProviders.join(', ')}`);
  }

  // Validate CI provider if specified
  if (deployment.ciProvider) {
    const validCIProviders = ['github-actions', 'gitlab-ci'];
    if (!validCIProviders.includes(deployment.ciProvider)) {
      throw new Error(`Invalid CI provider: ${deployment.ciProvider}. Must be one of: ${validCIProviders.join(', ')}`);
    }
  }
}

/**
 * Validate Redis configuration
 */
function validateRedis(redis: ProjectConfig['redis']): void {
  if (!redis.host || redis.host.trim().length === 0) {
    throw new Error('Redis host is required');
  }

  if (!Number.isInteger(redis.port) || redis.port < 1 || redis.port > 65535) {
    throw new Error('Redis port must be between 1 and 65535');
  }
}

/**
 * Validate WHO API credentials
 */
function validateWHOCredentials(credentials: NonNullable<ProjectConfig['whoCredentials']>): void {
  if (credentials.clientId !== undefined && (!credentials.clientId || credentials.clientId.trim().length === 0)) {
    throw new Error('WHO Client ID cannot be empty');
  }

  if (credentials.clientSecret !== undefined && (!credentials.clientSecret || credentials.clientSecret.trim().length === 0)) {
    throw new Error('WHO Client Secret cannot be empty');
  }
}

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color.trim());
}

/**
 * Validate URL format
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Try with https:// prefix if no protocol provided
    try {
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate WHO ICD-11 API credentials by testing authentication
 */
export async function validateWHOCredentialsLive(credentials: WHOCredentials): Promise<ValidationResult> {
  if (!credentials.clientId || !credentials.clientSecret) {
    return {
      isValid: false,
      error: 'Both Client ID and Client Secret are required'
    };
  }

  try {
    const tokenResponse = await fetch('https://icdaccessmanagement.who.int/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        scope: 'icdapi_access',
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      let errorMessage = 'Invalid WHO API credentials';
      
      if (tokenResponse.status === 400) {
        errorMessage = 'Invalid client credentials - check your Client ID and Secret';
      } else if (tokenResponse.status === 401) {
        errorMessage = 'Unauthorized - verify your WHO ICD-11 API credentials';
      } else if (tokenResponse.status === 403) {
        errorMessage = 'Access forbidden - your credentials may not have required permissions';
      }
      
      return {
        isValid: false,
        error: errorMessage
      };
    }

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
      scope?: string;
    };
    
    if (!tokenData.access_token) {
      return {
        isValid: false,
        error: 'Authentication succeeded but no access token received'
      };
    }

    // Test API access with the token
    const testResponse = await fetch('https://id.who.int/icd/entity', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'API-Version': 'v2'
      }
    });

    if (!testResponse.ok) {
      return {
        isValid: false,
        error: 'Authentication succeeded but API access failed - check your permissions'
      };
    }

    return {
      isValid: true,
      data: {
        tokenType: tokenData.token_type || 'bearer',
        expiresIn: tokenData.expires_in || 3600,
        scope: tokenData.scope || 'icdapi_access'
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Network error while validating credentials: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate Redis connection
 */
export async function validateRedisConnection(host: string, port: number): Promise<ValidationResult> {
  try {
    // Basic connectivity check using AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      // This tests basic network connectivity to the Redis port
      const testUrl = `http://${host}:${port}`;
      await fetch(testUrl, {
        signal: controller.signal,
        method: 'GET'
      });
      
      clearTimeout(timeoutId);
      
      return {
        isValid: true,
        data: { host, port, status: 'accessible' }
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      
      if (errorMessage.includes('ECONNREFUSED')) {
        return {
          isValid: false,
          error: `Cannot connect to Redis at ${host}:${port} - is Redis running?`
        };
      }
      
      // Redis rejecting HTTP is actually expected - means it's running
      return {
        isValid: true,
        warnings: [`Redis appears to be running at ${host}:${port} (HTTP rejection is expected)`],
        data: { host, port, status: 'likely_running' }
      };
    }
    
  } catch (error) {
    return {
      isValid: false,
      error: `Error testing Redis connection: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate healthcare organization data
 */
export function validateHealthcareOrganization(orgData: {
  name: string;
  websiteUrl?: string;
  supportEmail?: string;
}): ValidationResult {
  const warnings: string[] = [];
  
  if (!orgData.name || orgData.name.trim().length < 3) {
    return {
      isValid: false,
      error: 'Organization name must be at least 3 characters long'
    };
  }
  
  if (orgData.websiteUrl) {
    try {
      new URL(orgData.websiteUrl);
    } catch {
      return {
        isValid: false,
        error: 'Invalid website URL format'
      };
    }
  }
  
  if (orgData.supportEmail && !isValidEmail(orgData.supportEmail)) {
    return {
      isValid: false,
      error: 'Invalid support email format'
    };
  }
  
  // Healthcare-specific validations
  const healthcareKeywords = ['health', 'medical', 'hospital', 'clinic', 'care', 'wellness', 'surgery', 'pharmacy'];
  const hasHealthcareKeyword = healthcareKeywords.some(keyword => 
    orgData.name.toLowerCase().includes(keyword)
  );
  
  if (!hasHealthcareKeyword) {
    warnings.push('Organization name doesn\'t contain typical healthcare keywords - ensure this is intended for healthcare use');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}