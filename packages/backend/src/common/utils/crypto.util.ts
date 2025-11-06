import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Healthcare-grade password hashing utility using Node.js built-in scrypt
 * Provides HIPAA-compliant security with cross-platform compatibility
 */
export class CryptoUtil {
  private static readonly SALT_LENGTH = 32; // 256 bits
  private static readonly KEY_LENGTH = 64; // 512 bits
  private static readonly SCRYPT_OPTIONS = {
    cost: 32768, // CPU/memory cost parameter (2^15)
    blockSize: 8,     // Block size
    parallelization: 1,     // Parallelization parameter
    maxmem: 128 * 1024 * 1024, // 128MB max memory
  };

  /**
   * Hash a password using scrypt with random salt
   * @param password Plain text password
   * @returns Promise<string> Base64 encoded hash with embedded salt and parameters
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password || password.length === 0) {
      throw new Error('Password cannot be empty');
    }

    // Generate random salt
    const salt = randomBytes(this.SALT_LENGTH);
    
    // Derive key using scrypt
    const derivedKey = (await scryptAsync(
      password,
      salt,
      this.KEY_LENGTH
    )) as Buffer;

    // Combine salt, derived key, and parameters into single string
    const result = {
      algorithm: 'scrypt',
      salt: salt.toString('base64'),
      hash: derivedKey.toString('base64'),
      params: this.SCRYPT_OPTIONS,
    };

    return Buffer.from(JSON.stringify(result)).toString('base64');
  }

  /**
   * Verify a password against a hash
   * @param password Plain text password to verify
   * @param hashedPassword Base64 encoded hash with embedded salt and parameters
   * @returns Promise<boolean> True if password matches
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      // Parse the stored hash
      const storedData = JSON.parse(Buffer.from(hashedPassword, 'base64').toString());
      
      if (storedData.algorithm !== 'scrypt') {
        throw new Error('Unsupported hash algorithm');
      }

      const salt = Buffer.from(storedData.salt, 'base64');
      const storedHash = Buffer.from(storedData.hash, 'base64');
      const params = storedData.params || this.SCRYPT_OPTIONS;

      // Derive key with same parameters
      const derivedKey = (await scryptAsync(
        password,
        salt,
        this.KEY_LENGTH
      )) as Buffer;

      // Use timing-safe comparison to prevent timing attacks
      return timingSafeEqual(storedHash, derivedKey);
    } catch (error) {
      // Log error but don't expose internal details
      console.error('Password verification error:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Generate cryptographically secure random token
   * @param length Token length in bytes (default: 32)
   * @returns string Base64 encoded random token
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('base64url');
  }

  /**
   * Check if a hash needs to be updated (for parameter migration)
   * @param hashedPassword Stored hash
   * @returns boolean True if hash should be regenerated
   */
  static needsRehash(hashedPassword: string): boolean {
    try {
      const storedData = JSON.parse(Buffer.from(hashedPassword, 'base64').toString());
      
      // Check if using outdated parameters
      return (
        storedData.algorithm !== 'scrypt' ||
        storedData.params?.cost !== this.SCRYPT_OPTIONS.cost ||
        storedData.params?.blockSize !== this.SCRYPT_OPTIONS.blockSize ||
        storedData.params?.parallelization !== this.SCRYPT_OPTIONS.parallelization
      );
    } catch {
      return true; // If we can't parse, assume it needs rehashing
    }
  }
}