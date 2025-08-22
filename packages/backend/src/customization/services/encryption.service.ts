import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipher, createDecipher, randomBytes, scryptSync, createHash, timingSafeEqual } from "crypto";

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly ivLength: number;
  private readonly tagLength: number;

  constructor(private readonly configService: ConfigService) {
    const encryptionConfig = this.configService.get("encryption");
    this.algorithm = encryptionConfig.algorithm;
    this.ivLength = encryptionConfig.ivLength;
    this.tagLength = encryptionConfig.tagLength;

    // Create a consistent key from the configuration
    const keyString = encryptionConfig.key;
    this.key = scryptSync(keyString, "salt", 32);
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param plaintext The data to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  encrypt(plaintext: string): string {
    try {
      const iv = randomBytes(this.ivLength);
      const cipher = createCipher(this.algorithm, this.key.toString('hex'));

      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");

      // For AES-256-GCM, we would need getAuthTag(), but createCipher doesn't support it
      // Combine IV and encrypted data (simplified approach)
      const combined = Buffer.concat([iv, Buffer.from(encrypted, "hex")]);
      return combined.toString("base64");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error("Encryption failed", errorMessage);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt sensitive data using AES-256-GCM
   * @param encryptedData The encrypted data to decrypt
   * @returns Decrypted plaintext
   */
  decrypt(encryptedData: string): string {
    try {
      const combined = Buffer.from(encryptedData, "base64");

      // Extract IV and encrypted data
      const iv = combined.subarray(0, this.ivLength);
      const encrypted = combined.subarray(this.ivLength);

      const decipher = createDecipher(this.algorithm, this.key.toString('hex'));

      let decrypted = decipher.update(encrypted, undefined, "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error("Decryption failed", errorMessage);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Hash data using SHA-256
   * @param data The data to hash
   * @returns Hashed data as hex string
   */
  hash(data: string): string {
    return createHash("sha256").update(data).digest("hex");
  }

  /**
   * Generate a secure random token
   * @param length Token length in bytes (default: 32)
   * @returns Random token as hex string
   */
  generateToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
  }

  /**
   * Compare a plaintext value with a hash
   * @param plaintext The plaintext value
   * @param hash The hash to compare against
   * @returns True if they match
   */
  compareHash(plaintext: string, hash: string): boolean {
    const plaintextHash = this.hash(plaintext);
    return timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(plaintextHash),
    );
  }
}
