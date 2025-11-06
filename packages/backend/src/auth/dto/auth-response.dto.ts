import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { User, UserRole } from '../../entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: UserDto;

  constructor(accessToken: string, user: User) {
    this.accessToken = accessToken;
    this.user = new UserDto(user);
  }
}

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Email address' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'First name' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @Expose()
  lastName: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  fullName: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @Expose()
  role: UserRole;

  @ApiProperty({ description: 'Organization ID', nullable: true })
  @Expose()
  organizationId: string;

  @ApiProperty({ description: 'Account active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Email verification status' })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ description: 'Last login timestamp', nullable: true })
  @Expose()
  lastLogin: Date;

  @ApiProperty({ description: 'Account creation timestamp' })
  @Expose()
  createdAt: Date;

  // Exclude sensitive fields
  @Exclude()
  passwordHash: string;

  @Exclude()
  passwordResetToken: string;

  @Exclude()
  verificationToken: string;

  @Exclude()
  failedLoginAttempts: number;

  @Exclude()
  lockedUntil: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}