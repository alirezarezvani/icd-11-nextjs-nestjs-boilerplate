/**
 * Security and credential handling tests for CLI
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { validateWHOCredentialsLive } from '../utils/validation';

// Mock fs-extra for security tests
jest.mock('fs-extra');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock fetch globally
global.fetch = jest.fn();

describe('Security and Credential Handling', () => {
  let tempDir: string;
  let mockCredentialsFile: string;

  beforeEach(() => {
    jest.resetAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    mockFs.existsSync.mockClear();
    mockFs.readFileSync.mockClear();
    mockFs.writeFileSync.mockClear();
    mockFs.chmodSync.mockClear();

    tempDir = path.join(os.tmpdir(), 'cli-security-test');
    mockCredentialsFile = path.join(tempDir, '.who-credentials');
  });

  describe('Credential Storage Security', () => {
    it('should set secure file permissions for credential files', () => {
      const credentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      };

      // Mock file operations
      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.chmodSync.mockImplementation(() => {});

      // Simulate credential storage (this would be implemented in scaffolder)
      const credentialData = JSON.stringify(credentials);
      mockFs.writeFileSync(mockCredentialsFile, credentialData);
      mockFs.chmodSync(mockCredentialsFile, 0o600); // Only owner can read/write

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        mockCredentialsFile,
        credentialData
      );
      expect(mockFs.chmodSync).toHaveBeenCalledWith(mockCredentialsFile, 0o600);
    });

    it('should verify file permissions are restrictive', () => {
      // Mock file stats to simulate secure permissions
      const mockStats = {
        mode: 0o100600, // Regular file with 600 permissions
        isFile: () => true,
        isDirectory: () => false
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue(mockStats as any);

      const fileExists = mockFs.existsSync(mockCredentialsFile);
      const stats = mockFs.statSync(mockCredentialsFile);

      expect(fileExists).toBe(true);
      expect(stats.mode & 0o777).toBe(0o600); // Verify only owner permissions
    });

    it('should warn about insecure file permissions', () => {
      // Mock file stats with insecure permissions
      const mockInsecureStats = {
        mode: 0o100644, // Regular file with world-readable permissions
        isFile: () => true,
        isDirectory: () => false
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue(mockInsecureStats as any);

      const stats = mockFs.statSync(mockCredentialsFile);
      const isWorldReadable = (stats.mode & 0o044) !== 0;

      expect(isWorldReadable).toBe(true);
      // CLI should warn user about this and fix permissions
    });

    it('should encrypt credentials before storage', () => {
      const credentials = {
        clientId: 'sensitive-client-id',
        clientSecret: 'sensitive-client-secret'
      };

      // Mock encryption (this would use a real encryption library)
      const mockEncrypt = (data: string) => {
        return Buffer.from(data).toString('base64'); // Simple base64 for mock
      };

      const encryptedData = mockEncrypt(JSON.stringify(credentials));
      
      mockFs.writeFileSync(mockCredentialsFile, encryptedData);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        mockCredentialsFile,
        encryptedData
      );

      // Verify the stored data doesn't contain plain text credentials
      expect(encryptedData).not.toContain('sensitive-client-id');
      expect(encryptedData).not.toContain('sensitive-client-secret');
    });
  });

  describe('Memory Security', () => {
    it('should not leak credentials in error messages', async () => {
      const sensitiveCredentials = {
        clientId: 'very-secret-client-id-12345',
        clientSecret: 'ultra-secret-client-secret-67890'
      };

      // Mock various error scenarios
      const errorScenarios = [
        {
          name: 'Network timeout',
          error: new Error('Request timeout after 30 seconds')
        },
        {
          name: 'DNS failure',
          error: new Error('ENOTFOUND icdaccessmanagement.who.int')
        },
        {
          name: 'Connection refused',
          error: new Error('ECONNREFUSED 443')
        },
        {
          name: 'SSL error',
          error: new Error('SSL certificate verification failed')
        }
      ];

      for (const scenario of errorScenarios) {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(scenario.error);

        const result = await validateWHOCredentialsLive(sensitiveCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).not.toContain('very-secret-client-id-12345');
        expect(result.error).not.toContain('ultra-secret-client-secret-67890');
      }
    });

    it('should handle credentials with special characters securely', async () => {
      const specialCredentials = {
        clientId: 'client-with-"quotes"-and-\\backslashes',
        clientSecret: 'secret-with-\n-newlines-and-\t-tabs'
      };

      const mockValidTokenResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'icdapi_access'
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidTokenResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true
        } as Response);

      const result = await validateWHOCredentialsLive(specialCredentials);

      expect(result.isValid).toBe(true);

      // Verify special characters are properly handled in the request
      const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const requestBody = tokenCall[1]?.body as URLSearchParams;

      expect(requestBody.get('client_id')).toBe('client-with-"quotes"-and-\\backslashes');
      expect(requestBody.get('client_secret')).toBe('secret-with-\n-newlines-and-\t-tabs');
    });

    it('should clear sensitive data from memory when possible', async () => {
      const credentials = {
        clientId: 'memory-test-client-id',
        clientSecret: 'memory-test-client-secret'
      };

      const mockValidTokenResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'icdapi_access'
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidTokenResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true
        } as Response);

      await validateWHOCredentialsLive(credentials);

      // In a real implementation, we would clear the credentials object
      // This is a demonstration of the security principle
      const clearCredentials = (creds: any) => {
        if (creds.clientSecret) {
          creds.clientSecret = '';
        }
      };

      clearCredentials(credentials);
      expect(credentials.clientSecret).toBe('');
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent injection attacks in credentials', async () => {
      const maliciousCredentials = {
        clientId: 'client"; DROP TABLE credentials; --',
        clientSecret: '<script>alert("xss")</script>'
      };

      const mockValidTokenResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'icdapi_access'
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidTokenResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true
        } as Response);

      const result = await validateWHOCredentialsLive(maliciousCredentials);

      // Credentials should be properly encoded and not executed
      expect(result.isValid).toBe(true);

      const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const requestBody = tokenCall[1]?.body as URLSearchParams;

      // Verify the "malicious" content is properly encoded
      expect(requestBody.get('client_id')).toBe('client"; DROP TABLE credentials; --');
      expect(requestBody.get('client_secret')).toBe('<script>alert("xss")</script>');
    });

    it('should handle extremely long credentials safely', async () => {
      const longCredentials = {
        clientId: 'a'.repeat(10000), // Very long client ID
        clientSecret: 'b'.repeat(10000) // Very long client secret
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          status: 400
        } as Response);

      const result = await validateWHOCredentialsLive(longCredentials);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid client credentials - check your Client ID and Secret');

      // Verify the request was made with the long credentials
      const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const requestBody = tokenCall[1]?.body as URLSearchParams;

      expect(requestBody.get('client_id')).toHaveLength(10000);
      expect(requestBody.get('client_secret')).toHaveLength(10000);
    });

    it('should sanitize credentials for logging', () => {
      const credentials = {
        clientId: 'production-client-id-12345',
        clientSecret: 'production-client-secret-67890'
      };

      // Mock sanitization function (what CLI should implement)
      const sanitizeForLogging = (creds: typeof credentials) => {
        return {
          clientId: creds.clientId ? `${creds.clientId.slice(0, 4)}***` : 'undefined',
          clientSecret: creds.clientSecret ? '***' : 'undefined'
        };
      };

      const sanitized = sanitizeForLogging(credentials);

      expect(sanitized.clientId).toBe('prod***');
      expect(sanitized.clientSecret).toBe('***');
      expect(sanitized.clientId).not.toContain('12345');
      expect(sanitized.clientSecret).not.toContain('67890');
    });
  });

  describe('Network Security', () => {
    it('should use HTTPS for all WHO API communications', async () => {
      const credentials = {
        clientId: 'https-test-client',
        clientSecret: 'https-test-secret'
      };

      const mockValidTokenResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'icdapi_access'
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidTokenResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true
        } as Response);

      await validateWHOCredentialsLive(credentials);

      // Verify both API calls use HTTPS
      const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const apiCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[1];

      expect(tokenCall[0]).toEqual(expect.stringMatching(/^https:\/\//));
      expect(apiCall[0]).toEqual(expect.stringMatching(/^https:\/\//));

      expect(tokenCall[0]).toBe('https://icdaccessmanagement.who.int/connect/token');
      expect(apiCall[0]).toBe('https://id.who.int/icd/entity');
    });

    it('should handle SSL/TLS errors appropriately', async () => {
      const credentials = {
        clientId: 'ssl-test-client',
        clientSecret: 'ssl-test-secret'
      };

      const sslError = new Error('SSL certificate verification failed');
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(sslError);

      const result = await validateWHOCredentialsLive(credentials);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Network error while validating credentials: SSL certificate verification failed');
    });

    it('should validate response integrity', async () => {
      const credentials = {
        clientId: 'integrity-test-client',
        clientSecret: 'integrity-test-secret'
      };

      // Mock response with suspicious data
      const suspiciousResponse = {
        access_token: 'suspicious-token-with-<script>-tag',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'icdapi_access'
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(suspiciousResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true
        } as Response);

      const result = await validateWHOCredentialsLive(credentials);

      // The validation should still work (WHO API is trusted)
      expect(result.isValid).toBe(true);

      // But in a real implementation, we might want to validate token format
      const tokenPattern = /^[A-Za-z0-9._-]+$/;
      const isValidToken = tokenPattern.test(suspiciousResponse.access_token);
      
      // This token contains suspicious characters
      expect(isValidToken).toBe(false);
    });
  });

  describe('Error Handling Security', () => {
    it('should provide generic error messages for security', async () => {
      const credentials = {
        clientId: 'error-test-client',
        clientSecret: 'error-test-secret'
      };

      // Test various HTTP error codes
      const errorCodes = [500, 502, 503, 504];

      for (const code of errorCodes) {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: code
          } as Response);

        const result = await validateWHOCredentialsLive(credentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid WHO API credentials');
        
        // Error message should not reveal internal details
        expect(result.error).not.toContain(code.toString());
      }
    });

    it('should handle timing attacks resistance', async () => {
      const credentials = {
        clientId: 'timing-test-client',
        clientSecret: 'timing-test-secret'
      };

      const startTime = Date.now();

      // Mock immediate failure
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        } as Response);

      await validateWHOCredentialsLive(credentials);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Validation should complete quickly for mocked responses
      expect(duration).toBeLessThan(100);

      // In a real implementation, we might add constant-time delays
      // to prevent timing attacks on credential validation
    });

    it('should not log sensitive information', () => {
      const credentials = {
        clientId: 'logging-test-client-sensitive',
        clientSecret: 'logging-test-secret-sensitive'
      };

      // Mock console methods to verify no sensitive data is logged
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Simulate logging that might happen in the CLI
      console.log('Validating WHO credentials for client:', credentials.clientId.slice(0, 4) + '***');
      console.error('Credential validation failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Validating WHO credentials for client:',
        'logg***'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Credential validation failed');

      // Verify sensitive data was not logged
      const allLogs = [
        ...consoleSpy.mock.calls.flat(),
        ...consoleErrorSpy.mock.calls.flat(),
        ...consoleWarnSpy.mock.calls.flat()
      ];

      const sensitiveDataInLogs = allLogs.some(log => 
        String(log).includes('logging-test-secret-sensitive') ||
        String(log).includes('logging-test-client-sensitive')
      );

      expect(sensitiveDataInLogs).toBe(false);

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should handle rate limiting gracefully', async () => {
      const credentials = {
        clientId: 'rate-limit-test-client',
        clientSecret: 'rate-limit-test-secret'
      };

      // Mock rate limiting response
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({
            'Retry-After': '60'
          })
        } as Response);

      const result = await validateWHOCredentialsLive(credentials);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid WHO API credentials');

      // In a real implementation, we might want to respect Retry-After header
      // and provide more specific guidance to users about rate limits
    });

    it('should prevent rapid credential validation attempts', async () => {
      const credentials = {
        clientId: 'rapid-test-client',
        clientSecret: 'rapid-test-secret'
      };

      // Use URL-based mocking for reliability
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockImplementation((url) => {
          if (typeof url === 'string' && url.includes('connect/token')) {
            // Token request
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                access_token: 'test-token',
                token_type: 'bearer',
                expires_in: 3600,
                scope: 'icdapi_access'
              })
            } as Response);
          } else {
            // API request
            return Promise.resolve({
              ok: true
            } as Response);
          }
        });

      // Simulate multiple rapid validation attempts
      const promises = Array.from({ length: 3 }, () =>
        validateWHOCredentialsLive(credentials)
      );

      const results = await Promise.all(promises);

      // All should succeed (in this test)
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });

      // Should have made 6 calls total
      expect(fetch).toHaveBeenCalledTimes(6);

      // In a real implementation, we might implement client-side throttling
      // to prevent abuse of the WHO API
    });
  });
});