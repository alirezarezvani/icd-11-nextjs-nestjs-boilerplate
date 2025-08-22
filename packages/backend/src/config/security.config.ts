import { ConfigService } from '@nestjs/config';

/**
 * Healthcare-grade security configuration
 * Implements HIPAA compliance requirements and industry best practices
 */
export const securityConfig = () => ({
  security: {
    // JWT Configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'healthcare-grade-secret-please-change-in-production',
      accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
      refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION_DAYS || '7',
      issuer: process.env.JWT_ISSUER || 'icd11-healthcare-app',
      audience: process.env.JWT_AUDIENCE || 'healthcare-providers',
    },

    // Password Policy (HIPAA Compliant)
    password: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
      preventReuse: 12, // last 12 passwords
      lockoutThreshold: 5, // attempts
      lockoutDuration: 30, // minutes
    },

    // Session Management
    session: {
      timeout: 30, // minutes of inactivity
      absoluteTimeout: 8 * 60, // 8 hours maximum session
      concurrentSessions: 3, // maximum concurrent sessions per user
    },

    // Rate Limiting (Enhanced)
    rateLimit: {
      global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
      },
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // limit auth attempts per IP
      },
      api: {
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 100, // limit API calls per minute
      },
    },

    // CORS Configuration
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://localhost:3000',
      ],
      credentials: true,
      optionsSuccessStatus: 200,
    },

    // Cookie Security
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 15 * 60 * 1000, // 15 minutes (matches access token)
    },

    // Headers Security
    headers: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },

    // Audit Configuration
    audit: {
      enableAll: true,
      retentionDays: 2555, // 7 years (HIPAA requirement)
      sensitiveDataMasking: true,
      realTimeAlerts: true,
    },

    // Encryption
    encryption: {
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90,
      encryptPII: true,
      encryptAtRest: true,
    },

    // Access Control
    accessControl: {
      enableRBAC: true,
      enableABAC: false, // Attribute-based access control (future enhancement)
      defaultRole: 'user',
      adminRoles: ['super_admin', 'org_admin'],
    },

    // Data Classification
    dataClassification: {
      phi: ['email', 'firstName', 'lastName', 'ipAddress'], // Protected Health Information
      pci: [], // Payment Card Industry data
      pii: ['email', 'firstName', 'lastName'], // Personally Identifiable Information
    },

    // Compliance Flags
    compliance: {
      hipaa: true,
      gdpr: true,
      sox: false,
      pci: false,
    },
  },
});

/**
 * Security validation helper
 */
export class SecurityValidator {
  static validateJWTSecret(secret: string): boolean {
    return secret.length >= 32 && secret !== 'healthcare-grade-secret-please-change-in-production';
  }

  static validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = securityConfig().security.password;

    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static sanitizePHI(data: any): any {
    const phiFields = securityConfig().security.dataClassification.phi;
    const sanitized = { ...data };

    phiFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

export default securityConfig;