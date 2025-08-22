import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { AuditService } from './audit.service';
import { AuditAction } from '../../entities/audit-log.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async create(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await CryptoUtil.hashPassword(registerDto.password);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      passwordHash,
      // Set default verification status based on role
      isVerified: registerDto.role === UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    // Log registration
    await this.auditService.createLog({
      userId: savedUser.id,
      userEmail: savedUser.email,
      organizationId: savedUser.organizationId,
      action: AuditAction.REGISTER,
      ipAddress,
      userAgent,
      metadata: {
        role: savedUser.role,
        requiresVerification: !savedUser.isVerified,
      },
    });

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return CryptoUtil.verifyPassword(password, user.passwordHash);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await CryptoUtil.hashPassword(newPassword);

    await this.userRepository.update(userId, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    // Log password change
    const user = await this.findById(userId);
    if (user) {
      await this.auditService.createLog({
        userId,
        userEmail: user.email,
        organizationId: user.organizationId,
        action: AuditAction.PASSWORD_CHANGE,
      });
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.updateLastLogin();
      await this.userRepository.save(user);
    }
  }

  async incrementFailedAttempts(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.incrementFailedAttempts();
    const savedUser = await this.userRepository.save(user);

    // Log failed attempt
    await this.auditService.createLog({
      userId,
      userEmail: user.email,
      organizationId: user.organizationId,
      action: AuditAction.FAILED_LOGIN,
      status: 'failed',
      metadata: {
        failedAttempts: savedUser.failedLoginAttempts,
        isLocked: savedUser.isLocked,
      },
    });

    // Log if account gets locked
    if (savedUser.isLocked) {
      await this.auditService.createLog({
        userId,
        userEmail: user.email,
        organizationId: user.organizationId,
        action: AuditAction.ACCOUNT_LOCKED,
        status: 'warning',
        metadata: {
          lockedUntil: savedUser.lockedUntil,
          failedAttempts: savedUser.failedLoginAttempts,
        },
      });
    }

    return savedUser;
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.resetFailedAttempts();
      await this.userRepository.save(user);
    }
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't allow updating sensitive fields through this method
    const allowedFields: (keyof User)[] = ['firstName', 'lastName'];
    const filteredData: Partial<User> = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (filteredData as any)[field] = updateData[field];
      }
    });

    await this.userRepository.update(userId, filteredData);
    
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('Failed to retrieve updated user');
    }
    
    // Log profile update
    await this.auditService.createLog({
      userId,
      userEmail: user.email,
      organizationId: user.organizationId,
      action: AuditAction.PROFILE_UPDATE,
      metadata: {
        updatedFields: Object.keys(filteredData),
      },
    });

    return updatedUser;
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.userRepository.update(userId, { isActive: false });
  }

  async activateUser(userId: string): Promise<void> {
    await this.userRepository.update(userId, { isActive: true });
  }
}