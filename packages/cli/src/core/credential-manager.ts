/**
 * Secure credential management for healthcare applications
 * Handles WHO API credentials, encryption, and compliance requirements
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import chalk from 'chalk';
import { logger } from '../utils/logger';

export interface HealthcareCredentials {
  whoApi: {
    clientId: string;
    clientSecret: string;
    environment: 'production' | 'staging' | 'development';
    lastValidated?: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
    username?: string;
  };
  database?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
  };
  encryption: {
    keyId: string;
    algorithm: 'aes-256-gcm';
    created: string;
  };
  compliance: {
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    auditLogging: boolean;
    encryptionAtRest: boolean;
  };
}

export interface CredentialValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complianceIssues: string[];
}

class SimpleCipher {
  generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  encrypt(text: string, key: string): string {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData: string, key: string): string {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

export class HealthcareCredentialManager {
  private cipher: SimpleCipher;
  private credentialsDir: string;
  private keyFile: string;
  private credentialsFile: string;

  constructor(projectPath?: string) {
    // Store credentials in user's home directory for security
    this.credentialsDir = path.join(os.homedir(), '.icd11-cli');
    this.keyFile = path.join(this.credentialsDir, 'master.key');
    
    if (projectPath) {
      // Project-specific credentials
      const projectName = path.basename(projectPath);
      this.credentialsFile = path.join(this.credentialsDir, `${projectName}.credentials.enc`);
    } else {
      // Global credentials
      this.credentialsFile = path.join(this.credentialsDir, 'global.credentials.enc');
    }

    this.cipher = new SimpleCipher();
    this.ensureCredentialsDirectory();
  }

  /**
   * Ensure credentials directory exists with proper permissions
   */
  private async ensureCredentialsDirectory(): Promise<void> {
    try {
      await fs.ensureDir(this.credentialsDir);
      
      // Set restrictive permissions (owner only)
      if (process.platform !== 'win32') {
        await fs.chmod(this.credentialsDir, 0o700);
      }
    } catch (error) {
      logger.error('Failed to create credentials directory:', error);
      throw new Error('Could not initialize secure credential storage');
    }
  }

  /**
   * Generate or retrieve master encryption key
   */
  private async getMasterKey(): Promise<string> {
    if (await fs.pathExists(this.keyFile)) {
      try {
        const key = await fs.readFile(this.keyFile, 'utf-8');
        return key.trim();
      } catch (error) {
        logger.error('Failed to read master key:', error);
        throw new Error('Could not access encryption key');
      }
    } else {
      // Generate new master key
      const key = this.cipher.generateKey();
      
      try {
        await fs.writeFile(this.keyFile, key, { mode: 0o600 });
        logger.info('Generated new master encryption key');
        return key;
      } catch (error) {
        logger.error('Failed to save master key:', error);
        throw new Error('Could not save encryption key');
      }
    }
  }

  /**
   * Store healthcare credentials securely
   */
  async storeCredentials(credentials: HealthcareCredentials): Promise<void> {
    try {
      // Validate credentials before storing
      const validation = await this.validateCredentials(credentials);
      if (!validation.isValid) {
        throw new Error(`Invalid credentials: ${validation.errors.join(', ')}`);
      }

      // Add metadata
      const enhancedCredentials = {
        ...credentials,
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          cliVersion: process.env.npm_package_version || '1.0.0'
        }
      };

      // Encrypt credentials
      const masterKey = await this.getMasterKey();
      const encryptedData = this.cipher.encrypt(JSON.stringify(enhancedCredentials), masterKey);
      
      // Store encrypted credentials
      await fs.writeFile(this.credentialsFile, encryptedData, { mode: 0o600 });
      
      logger.info('Healthcare credentials stored securely');
      
      // Show compliance warnings if any
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Compliance warnings:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`   • ${warning}`));
        });
      }
      
    } catch (error) {
      logger.error('Failed to store credentials:', error);
      throw new Error('Could not store healthcare credentials securely');
    }
  }

  /**
   * Retrieve healthcare credentials
   */
  async getCredentials(): Promise<HealthcareCredentials | null> {
    if (!await fs.pathExists(this.credentialsFile)) {
      return null;
    }

    try {
      const encryptedData = await fs.readFile(this.credentialsFile, 'utf-8');
      const masterKey = await this.getMasterKey();
      
      const decryptedData = this.cipher.decrypt(encryptedData, masterKey);
      const credentials = JSON.parse(decryptedData) as HealthcareCredentials;
      
      return credentials;
    } catch (error) {
      logger.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Update specific credential field
   */
  async updateCredential<K extends keyof HealthcareCredentials>(
    field: K, 
    value: HealthcareCredentials[K]
  ): Promise<void> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      throw new Error('No credentials found to update');
    }

    credentials[field] = value;
    await this.storeCredentials(credentials);
  }

  /**
   * Validate healthcare credentials for compliance
   */
  async validateCredentials(credentials: HealthcareCredentials): Promise<CredentialValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const complianceIssues: string[] = [];

    // Validate WHO API credentials
    if (!credentials.whoApi.clientId || !credentials.whoApi.clientSecret) {
      errors.push('WHO API credentials are required');
    }

    if (credentials.whoApi.clientId && credentials.whoApi.clientId.length < 10) {
      warnings.push('WHO API Client ID seems unusually short');
    }

    if (credentials.whoApi.clientSecret && credentials.whoApi.clientSecret.length < 20) {
      warnings.push('WHO API Client Secret seems unusually short');
    }

    // Validate compliance settings
    if (!credentials.compliance.encryptionAtRest) {
      complianceIssues.push('Encryption at rest is not enabled - required for HIPAA compliance');
    }

    if (!credentials.compliance.auditLogging) {
      complianceIssues.push('Audit logging is not enabled - required for healthcare compliance');
    }

    if (credentials.compliance.hipaaCompliant && !credentials.compliance.auditLogging) {
      errors.push('HIPAA compliance requires audit logging to be enabled');
    }

    // Validate Redis credentials if provided
    if (credentials.redis) {
      if (!credentials.redis.password && credentials.compliance.hipaaCompliant) {
        complianceIssues.push('Redis password is recommended for HIPAA-compliant applications');
      }

      if (credentials.redis.port && (credentials.redis.port < 1 || credentials.redis.port > 65535)) {
        errors.push('Invalid Redis port number');
      }
    }

    // Validate database credentials if provided
    if (credentials.database) {
      if (!credentials.database.password) {
        errors.push('Database password is required');
      }

      if (!credentials.database.ssl && credentials.compliance.hipaaCompliant) {
        complianceIssues.push('SSL connection is recommended for database in HIPAA-compliant applications');
      }
    }

    // Environment-specific validations
    if (credentials.whoApi.environment === 'production') {
      if (credentials.redis && !credentials.redis.password) {
        complianceIssues.push('Production Redis instance should have password authentication');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceIssues
    };
  }

  /**
   * Test WHO API credentials
   */
  async testWHOCredentials(credentials?: HealthcareCredentials): Promise<boolean> {
    const creds = credentials || await this.getCredentials();
    if (!creds) {
      throw new Error('No credentials available to test');
    }

    try {
      const response = await fetch('https://icdaccessmanagement.who.int/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: creds.whoApi.clientId,
          client_secret: creds.whoApi.clientSecret,
          scope: 'icdapi_access',
          grant_type: 'client_credentials'
        })
      });

      if (response.ok) {
        // Update last validated timestamp
        await this.updateCredential('whoApi', {
          ...creds.whoApi,
          lastValidated: new Date().toISOString()
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('WHO API credential test failed:', error);
      return false;
    }
  }

  /**
   * Generate environment file content with proper security
   */
  async generateEnvironmentFile(
    type: 'backend' | 'frontend',
    outputPath: string,
    additionalVars?: Record<string, string>
  ): Promise<void> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      throw new Error('No credentials available for environment file generation');
    }

    let envContent = '';

    if (type === 'backend') {
      envContent = `# WHO ICD-11 API Configuration
ICD11_CLIENT_ID=${credentials.whoApi.clientId}
ICD11_CLIENT_SECRET=${credentials.whoApi.clientSecret}
ICD11_API_ENVIRONMENT=${credentials.whoApi.environment}

# Redis Configuration
${credentials.redis ? `REDIS_HOST=${credentials.redis.host}
REDIS_PORT=${credentials.redis.port}
${credentials.redis.password ? `REDIS_PASSWORD=${credentials.redis.password}` : ''}
${credentials.redis.username ? `REDIS_USERNAME=${credentials.redis.username}` : ''}` : '# Redis configuration not provided'}

# Database Configuration
${credentials.database ? `DATABASE_HOST=${credentials.database.host}
DATABASE_PORT=${credentials.database.port}
DATABASE_NAME=${credentials.database.database}
DATABASE_USERNAME=${credentials.database.username}
DATABASE_PASSWORD=${credentials.database.password}
DATABASE_SSL=${credentials.database.ssl || false}` : '# Database configuration not provided'}

# Security Configuration
ENCRYPTION_KEY_ID=${credentials.encryption.keyId}
AUDIT_LOGGING=${credentials.compliance.auditLogging}
HIPAA_COMPLIANT=${credentials.compliance.hipaaCompliant}
GDPR_COMPLIANT=${credentials.compliance.gdprCompliant}

# Application Configuration
NODE_ENV=${credentials.whoApi.environment}
`;
    } else {
      envContent = `# Frontend Configuration
NEXT_PUBLIC_API_ENVIRONMENT=${credentials.whoApi.environment}
NEXT_PUBLIC_HIPAA_MODE=${credentials.compliance.hipaaCompliant}
NEXT_PUBLIC_AUDIT_MODE=${credentials.compliance.auditLogging}
`;
    }

    // Add additional variables
    if (additionalVars) {
      envContent += '\n# Additional Configuration\n';
      Object.entries(additionalVars).forEach(([key, value]) => {
        envContent += `${key}=${value}\n`;
      });
    }

    // Add security notice
    envContent += `
# Security Notice
# This file contains sensitive healthcare credentials
# - Do not commit this file to version control
# - Ensure proper file permissions (600)
# - Rotate credentials regularly
# - Use environment-specific values for production
`;

    await fs.writeFile(outputPath, envContent, { mode: 0o600 });
    logger.info(`Environment file generated: ${outputPath}`);
  }

  /**
   * Remove all stored credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      if (await fs.pathExists(this.credentialsFile)) {
        await fs.remove(this.credentialsFile);
        logger.info('Credentials cleared successfully');
      }
    } catch (error) {
      logger.error('Failed to clear credentials:', error);
      throw new Error('Could not clear stored credentials');
    }
  }

  /**
   * Check if credentials exist
   */
  async hasCredentials(): Promise<boolean> {
    return fs.pathExists(this.credentialsFile);
  }

  /**
   * Get compliance status report
   */
  async getComplianceReport(): Promise<{
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      return {
        hipaaCompliant: false,
        gdprCompliant: false,
        issues: ['No credentials configured'],
        recommendations: ['Configure healthcare credentials with proper compliance settings']
      };
    }

    const validation = await this.validateCredentials(credentials);
    
    return {
      hipaaCompliant: credentials.compliance.hipaaCompliant && validation.complianceIssues.length === 0,
      gdprCompliant: credentials.compliance.gdprCompliant,
      issues: validation.complianceIssues,
      recommendations: [
        ...(validation.warnings.length > 0 ? ['Address validation warnings'] : []),
        ...(credentials.compliance.hipaaCompliant ? [] : ['Enable HIPAA compliance mode']),
        ...(credentials.compliance.auditLogging ? [] : ['Enable audit logging']),
        ...(credentials.compliance.encryptionAtRest ? [] : ['Enable encryption at rest'])
      ]
    };
  }
}

export default HealthcareCredentialManager;