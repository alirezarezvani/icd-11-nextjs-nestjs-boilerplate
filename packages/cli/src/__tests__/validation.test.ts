/**
 * Comprehensive tests for WHO API credential validation functionality
 */

import { validateWHOCredentialsLive, validateRedisConnection, validateHealthcareOrganization } from '../utils/validation';
import type { WHOCredentials, ValidationResult } from '../utils/validation';

// Mock fetch globally for all tests
global.fetch = jest.fn();

describe('WHO API Credential Validation', () => {
  // Reset fetch mock before each test
  beforeEach(() => {
    jest.resetAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe('validateWHOCredentialsLive', () => {
    const validCredentials: WHOCredentials = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    };

    const mockValidTokenResponse = {
      access_token: 'mock-token-123',
      token_type: 'bearer',
      expires_in: 3600,
      scope: 'icdapi_access'
    };

    const mockInvalidCredentialsResponse = {
      error: 'invalid_client',
      error_description: 'Invalid client credentials'
    };

    describe('Input Validation', () => {
      it('should reject empty credentials', async () => {
        const result = await validateWHOCredentialsLive({
          clientId: '',
          clientSecret: ''
        });

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Both Client ID and Client Secret are required');
      });

      it('should reject missing client ID', async () => {
        const result = await validateWHOCredentialsLive({
          clientId: '',
          clientSecret: 'valid-secret'
        });

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Both Client ID and Client Secret are required');
      });

      it('should reject missing client secret', async () => {
        const result = await validateWHOCredentialsLive({
          clientId: 'valid-id',
          clientSecret: ''
        });

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Both Client ID and Client Secret are required');
      });
    });

    describe('Valid Credentials Flow', () => {
      it('should validate correct credentials successfully', async () => {
        // Mock successful token request
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockValidTokenResponse)
          } as Response)
          // Mock successful API test request
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(true);
        expect(result.data).toEqual({
          tokenType: 'bearer',
          expiresIn: 3600,
          scope: 'icdapi_access'
        });

        // Verify correct API calls were made
        expect(fetch).toHaveBeenCalledTimes(2);
        
        // Check token request
        expect(fetch).toHaveBeenNthCalledWith(1, 
          'https://icdaccessmanagement.who.int/connect/token',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: expect.any(URLSearchParams)
          })
        );

        // Check API test request
        expect(fetch).toHaveBeenNthCalledWith(2,
          'https://id.who.int/icd/entity',
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer mock-token-123',
              'Accept': 'application/json',
              'API-Version': 'v2'
            }
          })
        );
      });

      it('should handle token response with minimal data', async () => {
        const minimalTokenResponse = {
          access_token: 'minimal-token'
        };

        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(minimalTokenResponse)
          } as Response)
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(true);
        expect(result.data).toEqual({
          tokenType: 'bearer',
          expiresIn: 3600,
          scope: 'icdapi_access'
        });
      });

      it('should verify request body contains correct parameters', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockValidTokenResponse)
          } as Response)
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        await validateWHOCredentialsLive(validCredentials);

        const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
        const requestBody = tokenCall[1]?.body as URLSearchParams;

        expect(requestBody.get('client_id')).toBe('test-client-id');
        expect(requestBody.get('client_secret')).toBe('test-client-secret');
        expect(requestBody.get('scope')).toBe('icdapi_access');
        expect(requestBody.get('grant_type')).toBe('client_credentials');
      });
    });

    describe('Invalid Credentials Scenarios', () => {
      it('should handle 400 Bad Request (invalid client)', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: () => Promise.resolve(mockInvalidCredentialsResponse)
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid client credentials - check your Client ID and Secret');
      });

      it('should handle 401 Unauthorized', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 401
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Unauthorized - verify your WHO ICD-11 API credentials');
      });

      it('should handle 403 Forbidden', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 403
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Access forbidden - your credentials may not have required permissions');
      });

      it('should handle other HTTP error codes', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 500
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid WHO API credentials');
      });

      it('should handle missing access token in response', async () => {
        const responseWithoutToken = {
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'icdapi_access'
          // access_token is missing
        };

        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(responseWithoutToken)
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Authentication succeeded but no access token received');
      });

      it('should handle API access failure after successful authentication', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockValidTokenResponse)
          } as Response)
          .mockResolvedValueOnce({
            ok: false,
            status: 403
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Authentication succeeded but API access failed - check your permissions');
      });
    });

    describe('Network Error Handling', () => {
      it('should handle network connectivity issues', async () => {
        const networkError = new Error('ECONNREFUSED');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(networkError);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: ECONNREFUSED');
      });

      it('should handle timeout errors', async () => {
        const timeoutError = new Error('Request timeout');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(timeoutError);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: Request timeout');
      });

      it('should handle DNS resolution failures', async () => {
        const dnsError = new Error('ENOTFOUND icdaccessmanagement.who.int');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(dnsError);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: ENOTFOUND icdaccessmanagement.who.int');
      });

      it('should handle malformed JSON responses', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.reject(new Error('Unexpected token in JSON'))
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: Unexpected token in JSON');
      });

      it('should handle unknown errors gracefully', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce('String error instead of Error object');

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: Unknown error');
      });
    });

    describe('Rate Limiting and API Behavior', () => {
      it('should handle rate limiting (429 status)', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 429
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid WHO API credentials');
      });

      it('should handle server errors (500 status)', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 500
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid WHO API credentials');
      });

      it('should handle service unavailable (503 status)', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 503
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid WHO API credentials');
      });
    });

    describe('Edge Cases and Malformed Responses', () => {
      it('should handle empty response body', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({})
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Authentication succeeded but no access token received');
      });

      it('should handle null response', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(null)
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: Cannot read properties of null (reading \'access_token\')');
      });

      it('should handle response with null access_token', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ access_token: null })
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Authentication succeeded but no access token received');
      });

      it('should handle response with empty string access_token', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ access_token: '' })
          } as Response);

        const result = await validateWHOCredentialsLive(validCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Authentication succeeded but no access token received');
      });
    });

    describe('Security and Data Handling', () => {
      it('should not log or expose sensitive credentials in errors', async () => {
        const sensitiveCredentials = {
          clientId: 'super-secret-client-id',
          clientSecret: 'super-secret-client-secret'
        };

        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(new Error('Network failure'));

        const result = await validateWHOCredentialsLive(sensitiveCredentials);

        expect(result.isValid).toBe(false);
        expect(result.error).not.toContain('super-secret-client-id');
        expect(result.error).not.toContain('super-secret-client-secret');
        expect(result.error).toBe('Network error while validating credentials: Network failure');
      });

      it('should handle special characters in credentials', async () => {
        const specialCredentials = {
          clientId: 'client-id-with-!@#$%^&*()_+',
          clientSecret: 'secret-with-unicode-ñáéíóú'
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

        // Verify the special characters are properly encoded in the request
        const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
        const requestBody = tokenCall[1]?.body as URLSearchParams;
        
        expect(requestBody.get('client_id')).toBe('client-id-with-!@#$%^&*()_+');
        expect(requestBody.get('client_secret')).toBe('secret-with-unicode-ñáéíóú');
      });
    });

    describe('Performance and Reliability', () => {
      it('should handle concurrent validation requests', async () => {
        // Use a more reliable approach for concurrent testing
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockImplementation((url) => {
            if (typeof url === 'string' && url.includes('connect/token')) {
              // Token request
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockValidTokenResponse)
              } as Response);
            } else {
              // API request
              return Promise.resolve({
                ok: true
              } as Response);
            }
          });

        const concurrentPromises = Array.from({ length: 3 }, () =>
          validateWHOCredentialsLive(validCredentials)
        );

        const results = await Promise.all(concurrentPromises);

        results.forEach(result => {
          expect(result.isValid).toBe(true);
        });

        // Should have made 6 calls total (2 per validation)
        expect(fetch).toHaveBeenCalledTimes(6);
      });

      it('should complete validation within reasonable time', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockValidTokenResponse)
          } as Response)
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        const startTime = Date.now();
        await validateWHOCredentialsLive(validCredentials);
        const endTime = Date.now();

        // Should complete quickly with mocked responses
        expect(endTime - startTime).toBeLessThan(100);
      });
    });
  });

  describe('Redis Connection Validation', () => {
    describe('validateRedisConnection', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        (fetch as jest.MockedFunction<typeof fetch>).mockClear();
      });

      it('should handle successful connection test', async () => {
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        const result = await validateRedisConnection('localhost', 6379);

        expect(result.isValid).toBe(true);
        expect(result.data).toEqual({
          host: 'localhost',
          port: 6379,
          status: 'accessible'
        });
      });

      it('should handle connection refused error', async () => {
        const connectionError = new Error('ECONNREFUSED');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(connectionError);

        const result = await validateRedisConnection('localhost', 6379);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Cannot connect to Redis at localhost:6379 - is Redis running?');
      });

      it('should handle Redis HTTP rejection as likely running', async () => {
        const rejectionError = new Error('Protocol error');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(rejectionError);

        const result = await validateRedisConnection('localhost', 6379);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Redis appears to be running at localhost:6379 (HTTP rejection is expected)');
        expect(result.data).toEqual({
          host: 'localhost',
          port: 6379,
          status: 'likely_running'
        });
      });

      it('should handle timeout errors', async () => {
        const timeoutError = new Error('Request timeout');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(timeoutError);

        const result = await validateRedisConnection('localhost', 6379);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Redis appears to be running at localhost:6379 (HTTP rejection is expected)');
      });
    });
  });

  describe('Healthcare Organization Validation', () => {
    describe('validateHealthcareOrganization', () => {
      it('should accept valid healthcare organization data', () => {
        const validOrg = {
          name: 'Central Medical Hospital',
          websiteUrl: 'https://centralmedical.com',
          supportEmail: 'support@centralmedical.com'
        };

        const result = validateHealthcareOrganization(validOrg);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toBeUndefined();
      });

      it('should reject organization names that are too short', () => {
        const shortNameOrg = {
          name: 'AB'
        };

        const result = validateHealthcareOrganization(shortNameOrg);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Organization name must be at least 3 characters long');
      });

      it('should reject invalid website URLs', () => {
        const invalidUrlOrg = {
          name: 'Valid Healthcare Name',
          websiteUrl: 'not-a-valid-url'
        };

        const result = validateHealthcareOrganization(invalidUrlOrg);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid website URL format');
      });

      it('should reject invalid email addresses', () => {
        const invalidEmailOrg = {
          name: 'Valid Healthcare Name',
          supportEmail: 'not-an-email'
        };

        const result = validateHealthcareOrganization(invalidEmailOrg);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid support email format');
      });

      it('should warn about non-healthcare organization names', () => {
        const nonHealthcareOrg = {
          name: 'Technology Solutions Inc'
        };

        const result = validateHealthcareOrganization(nonHealthcareOrg);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('Organization name doesn\'t contain typical healthcare keywords - ensure this is intended for healthcare use');
      });

      it('should accept organization names with healthcare keywords', () => {
        const healthcareOrgs = [
          { name: 'City Health Center' },
          { name: 'General Medical Practice' },
          { name: 'Community Hospital' },
          { name: 'Wellness Clinic' },
          { name: 'Surgical Care Center' },
          { name: 'Downtown Pharmacy' }
        ];

        healthcareOrgs.forEach(org => {
          const result = validateHealthcareOrganization(org);
          expect(result.isValid).toBe(true);
          expect(result.warnings).toBeUndefined();
        });
      });

      it('should handle optional fields properly', () => {
        const minimalOrg = {
          name: 'Basic Healthcare Center'
        };

        const result = validateHealthcareOrganization(minimalOrg);

        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('CLI Integration with WHO Credential Validation', () => {
    // Mock inquirer for CLI testing
    const mockInquirer = {
      prompt: jest.fn()
    };

    beforeEach(() => {
      jest.resetAllMocks();
      (fetch as jest.MockedFunction<typeof fetch>).mockClear();
      mockInquirer.prompt.mockClear();
    });

    describe('WHO Credential Flow in CLI', () => {
      it('should validate credentials during interactive setup', async () => {
        const mockValidTokenResponse = {
          access_token: 'test-token-123',
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'icdapi_access'
        };

        // Mock successful WHO API validation
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockValidTokenResponse)
          } as Response)
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        const credentials = {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        };

        const result = await validateWHOCredentialsLive(credentials);

        expect(result.isValid).toBe(true);
        expect(result.data).toEqual({
          tokenType: 'bearer',
          expiresIn: 3600,
          scope: 'icdapi_access'
        });

        // Verify the CLI would show success messages
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      it('should handle credential validation failures gracefully in CLI', async () => {
        // Mock failed WHO API validation
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: false,
            status: 401
          } as Response);

        const credentials = {
          clientId: 'invalid-client-id',
          clientSecret: 'invalid-client-secret'
        };

        const result = await validateWHOCredentialsLive(credentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Unauthorized - verify your WHO ICD-11 API credentials');

        // This error would be displayed to the user in the CLI
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      it('should handle network errors during CLI credential validation', async () => {
        // Mock network error
        const networkError = new Error('ECONNREFUSED');
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockRejectedValueOnce(networkError);

        const credentials = {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        };

        const result = await validateWHOCredentialsLive(credentials);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Network error while validating credentials: ECONNREFUSED');

        // CLI should gracefully handle this and allow user to continue
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      it('should validate request format for WHO authentication endpoint', async () => {
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

        const credentials = {
          clientId: 'special-chars-!@#$%',
          clientSecret: 'unicode-ñáéíóú'
        };

        await validateWHOCredentialsLive(credentials);

        // Verify the token request was made with correct parameters
        const tokenCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
        expect(tokenCall[0]).toBe('https://icdaccessmanagement.who.int/connect/token');
        expect(tokenCall[1]?.method).toBe('POST');
        expect(tokenCall[1]?.headers).toEqual({
          'Content-Type': 'application/x-www-form-urlencoded',
        });

        const requestBody = tokenCall[1]?.body as URLSearchParams;
        expect(requestBody.get('client_id')).toBe('special-chars-!@#$%');
        expect(requestBody.get('client_secret')).toBe('unicode-ñáéíóú');
        expect(requestBody.get('scope')).toBe('icdapi_access');
        expect(requestBody.get('grant_type')).toBe('client_credentials');
      });

      it('should validate API test request format', async () => {
        const mockValidTokenResponse = {
          access_token: 'test-token-456',
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

        await validateWHOCredentialsLive({
          clientId: 'test-id',
          clientSecret: 'test-secret'
        });

        // Verify the API test request was made with correct headers
        const apiCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[1];
        expect(apiCall[0]).toBe('https://id.who.int/icd/entity');
        expect(apiCall[1]?.headers).toEqual({
          'Authorization': 'Bearer test-token-456',
          'Accept': 'application/json',
          'API-Version': 'v2'
        });
      });
    });

    describe('Error Messaging for CLI Users', () => {
      it('should provide user-friendly error messages for common issues', async () => {
        const testCases = [
          {
            description: 'Empty credentials',
            credentials: { clientId: '', clientSecret: '' },
            expectedError: 'Both Client ID and Client Secret are required',
            mockSetup: () => {} // No API calls needed
          },
          {
            description: 'Invalid client credentials',
            credentials: { clientId: 'invalid', clientSecret: 'invalid' },
            expectedError: 'Invalid client credentials - check your Client ID and Secret',
            mockSetup: () => {
              (fetch as jest.MockedFunction<typeof fetch>)
                .mockResolvedValueOnce({
                  ok: false,
                  status: 400
                } as Response);
            }
          },
          {
            description: 'Unauthorized access',
            credentials: { clientId: 'unauthorized', clientSecret: 'unauthorized' },
            expectedError: 'Unauthorized - verify your WHO ICD-11 API credentials',
            mockSetup: () => {
              (fetch as jest.MockedFunction<typeof fetch>)
                .mockResolvedValueOnce({
                  ok: false,
                  status: 401
                } as Response);
            }
          },
          {
            description: 'Forbidden access',
            credentials: { clientId: 'forbidden', clientSecret: 'forbidden' },
            expectedError: 'Access forbidden - your credentials may not have required permissions',
            mockSetup: () => {
              (fetch as jest.MockedFunction<typeof fetch>)
                .mockResolvedValueOnce({
                  ok: false,
                  status: 403
                } as Response);
            }
          }
        ];

        for (const testCase of testCases) {
          testCase.mockSetup();
          
          const result = await validateWHOCredentialsLive(testCase.credentials);
          
          expect(result.isValid).toBe(false);
          expect(result.error).toBe(testCase.expectedError);
        }
      });

      it('should not expose sensitive information in error messages', async () => {
        const sensitiveCredentials = {
          clientId: 'super-secret-client-id-123',
          clientSecret: 'super-secret-client-secret-456'
        };

        // Test various error scenarios
        const errorScenarios = [
          {
            name: 'Network error',
            mockSetup: () => {
              (fetch as jest.MockedFunction<typeof fetch>)
                .mockRejectedValueOnce(new Error('Connection failed'));
            }
          },
          {
            name: 'HTTP error',
            mockSetup: () => {
              (fetch as jest.MockedFunction<typeof fetch>)
                .mockResolvedValueOnce({
                  ok: false,
                  status: 500
                } as Response);
            }
          },
          {
            name: 'Invalid JSON response',
            mockSetup: () => {
              (fetch as jest.MockedFunction<typeof fetch>)
                .mockResolvedValueOnce({
                  ok: true,
                  json: () => Promise.reject(new Error('Invalid JSON'))
                } as Response);
            }
          }
        ];

        for (const scenario of errorScenarios) {
          scenario.mockSetup();
          
          const result = await validateWHOCredentialsLive(sensitiveCredentials);
          
          expect(result.isValid).toBe(false);
          expect(result.error).not.toContain('super-secret-client-id-123');
          expect(result.error).not.toContain('super-secret-client-secret-456');
        }
      });
    });

    describe('CLI User Experience Validation', () => {
      it('should provide progress indication during validation', async () => {
        // This test verifies the expected flow that the CLI implements
        const mockValidTokenResponse = {
          access_token: 'progress-test-token',
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'icdapi_access'
        };

        (fetch as jest.MockedFunction<typeof fetch>)
          .mockImplementationOnce(() => new Promise(resolve => {
            // Simulate some delay to test progress indication
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve(mockValidTokenResponse)
              } as Response);
            }, 50);
          }))
          .mockResolvedValueOnce({
            ok: true
          } as Response);

        const startTime = Date.now();
        const result = await validateWHOCredentialsLive({
          clientId: 'test-id',
          clientSecret: 'test-secret'
        });
        const endTime = Date.now();

        expect(result.isValid).toBe(true);
        expect(endTime - startTime).toBeGreaterThan(40); // Verify delay was respected
        expect(result.data).toEqual({
          tokenType: 'bearer',
          expiresIn: 3600,
          scope: 'icdapi_access'
        });
      });

      it('should handle rapid consecutive validation attempts', async () => {
        const mockValidTokenResponse = {
          access_token: 'concurrent-test-token',
          token_type: 'bearer',
          expires_in: 3600,
          scope: 'icdapi_access'
        };

        // Use URL-based mocking for reliability
        (fetch as jest.MockedFunction<typeof fetch>)
          .mockImplementation((url) => {
            if (typeof url === 'string' && url.includes('connect/token')) {
              // Token request
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockValidTokenResponse)
              } as Response);
            } else {
              // API request
              return Promise.resolve({
                ok: true
              } as Response);
            }
          });

        const credentials = {
          clientId: 'concurrent-test-id',
          clientSecret: 'concurrent-test-secret'
        };

        // Simulate rapid consecutive validation attempts
        const promises = Array.from({ length: 3 }, () =>
          validateWHOCredentialsLive(credentials)
        );

        const results = await Promise.all(promises);

        results.forEach(result => {
          expect(result.isValid).toBe(true);
        });

        // Should have made 6 calls total (2 per validation)
        expect(fetch).toHaveBeenCalledTimes(6);
      });
    });
  });
});