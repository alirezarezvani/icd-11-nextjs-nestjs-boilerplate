import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { User, UserStatus } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dto/auth.dto';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, ip: string): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, role, organizationId } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Create new user
      const user = this.userRepository.create({
        email,
        password, // Will be hashed by the entity's @BeforeInsert hook
        firstName,
        lastName,
        role,
        organizationId,
        status: UserStatus.ACTIVE, // In production, this should be PENDING_VERIFICATION
        emailVerificationToken: uuidv4(),
      });

      const savedUser = await this.userRepository.save(user);

      // Log registration
      this.logger.log(`User registered: ${email} from IP: ${ip}`);

      // Generate tokens
      const tokens = await this.generateTokens(savedUser, ip);

      return {
        ...tokens,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          status: savedUser.status,
          isEmailVerified: savedUser.isEmailVerified,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Registration failed for ${email}: ${errorMessage}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto, ip: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    try {
      const user = await this.validateUser(email, password, ip);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Record successful login
      user.recordSuccessfulLogin(ip);
      await this.userRepository.save(user);

      this.logger.log(`User logged in: ${email} from IP: ${ip}`);

      // Generate tokens
      const tokens = await this.generateTokens(user, ip);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Login failed for ${email}: ${errorMessage}`);
      throw error;
    }
  }

  async validateUser(email: string, password: string, ip?: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.isLocked) {
      if (ip) {
        this.logger.warn(`Login attempt on locked account: ${email} from IP: ${ip}`);
      }
      throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.incrementFailedLoginAttempts();
      await this.userRepository.save(user);
      
      if (ip) {
        this.logger.warn(`Failed login attempt: ${email} from IP: ${ip} (${user.failedLoginAttempts} attempts)`);
      }
      
      return null;
    }

    // Check if password needs rehashing (security parameter upgrade)
    if (user.needsPasswordRehash()) {
      this.logger.log(`Rehashing password for user: ${email} due to security parameter upgrade`);
      user.password = password; // Will be hashed by @BeforeUpdate hook
      // Note: Will be saved when recordSuccessfulLogin is called
    }

    return user;
  }

  async refreshToken(token: string, ip: string): Promise<AuthResponseDto> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken || !refreshToken.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = refreshToken.user;

    // Revoke old refresh token
    refreshToken.revoked = true;
    refreshToken.revokedAt = new Date();
    refreshToken.revokedByIp = ip;
    await this.refreshTokenRepository.save(refreshToken);

    // Generate new tokens
    const tokens = await this.generateTokens(user, ip);
    
    this.logger.log(`Token refreshed for user: ${user.email} from IP: ${ip}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async logout(userId: string, refreshToken: string, ip: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, userId },
      relations: ['user'],
    });

    if (token) {
      token.revoked = true;
      token.revokedAt = new Date();
      token.revokedByIp = ip;
      await this.refreshTokenRepository.save(token);
      
      this.logger.log(`User logged out: ${token.user.email} from IP: ${ip}`);
    }
  }

  async logoutAll(userId: string, ip: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date(), revokedByIp: ip }
    );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      this.logger.log(`All sessions logged out for user: ${user.email} from IP: ${ip}`);
    }
  }

  private async generateTokens(user: User, ip: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION', '15m'),
    });

    // Create refresh token
    const refreshToken = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(
      refreshTokenExpiry.getDate() + 
      parseInt(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DAYS', '7'))
    );

    // Save refresh token to database
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
      createdByIp: ip,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    // Clean up expired refresh tokens
    await this.cleanupExpiredTokens(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({
      userId,
      expiresAt: new Date(),
    });
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || user.isLocked) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }
}