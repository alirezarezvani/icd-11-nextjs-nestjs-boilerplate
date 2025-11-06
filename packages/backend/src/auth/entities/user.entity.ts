import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { RefreshToken } from './refresh-token.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  accountLockedUntil?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastLoginIp?: string;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetTokenExpiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.includes('algorithm')) {
      this.password = await CryptoUtil.hashPassword(this.password);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return CryptoUtil.verifyPassword(password, this.password);
  }

  /**
   * Check if password needs rehashing due to updated security parameters
   */
  needsPasswordRehash(): boolean {
    return CryptoUtil.needsRehash(this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isLocked(): boolean {
    if (this.status === UserStatus.LOCKED) return true;
    if (this.accountLockedUntil && this.accountLockedUntil > new Date()) {
      return true;
    }
    return false;
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  lockAccount(duration: number = 30 * 60 * 1000): void { // 30 minutes default
    this.status = UserStatus.LOCKED;
    this.accountLockedUntil = new Date(Date.now() + duration);
  }

  unlockAccount(): void {
    this.status = UserStatus.ACTIVE;
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = undefined;
  }

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
      this.lockAccount();
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = undefined;
  }

  recordSuccessfulLogin(ip: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
    this.resetFailedLoginAttempts();
  }
}