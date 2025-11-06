import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  replacedByToken?: string;

  @Column({ nullable: true })
  revokedByIp?: string;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column()
  createdByIp: string;

  @CreateDateColumn()
  createdAt: Date;

  get isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  get isActive(): boolean {
    return !this.revoked && !this.isExpired;
  }
}