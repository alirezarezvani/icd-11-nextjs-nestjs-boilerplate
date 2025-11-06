import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { RefreshToken } from '../../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService,
  ) {}

  async generateRefreshToken(userId: string): Promise<string> {
    // Generate a cryptographically secure random token
    const token = crypto.randomBytes(64).toString('hex');
    
    // Hash the token for storage
    const tokenHash = await CryptoUtil.hashPassword(token);
    
    // Set expiration (7 days by default)
    const expirationTime = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') || '7d';
    const expiresAt = this.calculateExpiration(expirationTime);

    // Clean up expired tokens for this user
    await this.cleanupExpiredTokens(userId);

    // Create and save the refresh token
    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token; // Return the plain token to the client
  }

  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    // Find all non-revoked, non-expired tokens
    const tokens = await this.refreshTokenRepository.find({
      where: {
        isRevoked: false,
      },
      relations: ['user'],
    });

    // Check each token hash against the provided token
    for (const tokenRecord of tokens) {
      if (!tokenRecord.isExpired && await CryptoUtil.verifyPassword(token, tokenRecord.tokenHash)) {
        return tokenRecord;
      }
    }

    return null;
  }

  async revokeToken(token: string): Promise<void> {
    const tokenRecord = await this.validateRefreshToken(token);
    
    if (tokenRecord) {
      tokenRecord.revoke();
      await this.refreshTokenRepository.save(tokenRecord);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  private async cleanupExpiredTokens(userId?: string): Promise<void> {
    const query = this.refreshTokenRepository.createQueryBuilder('token')
      .delete()
      .where('token.expiresAt < :now', { now: new Date() })
      .orWhere('token.isRevoked = :revoked', { revoked: true });

    if (userId) {
      query.andWhere('token.userId = :userId', { userId });
    }

    await query.execute();
  }

  private calculateExpiration(expiration: string): Date {
    const now = new Date();
    
    // Parse expiration string (e.g., '7d', '24h', '30m')
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);
    
    switch (unit) {
      case 'd': // days
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case 'h': // hours
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'm': // minutes
        return new Date(now.getTime() + value * 60 * 1000);
      default:
        // Default to 7 days
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Cleanup service - should be run periodically
  async cleanupAllExpiredTokens(): Promise<void> {
    await this.cleanupExpiredTokens();
  }
}