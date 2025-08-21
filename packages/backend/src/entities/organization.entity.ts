import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OrganizationBranding } from './organization-branding.entity';
import { OrganizationUser } from './organization-user.entity';
import { AuditLog } from './audit-log.entity';

@Entity('organizations')
@Index(['slug'], { unique: true })
@Index(['domain'], { unique: true })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @Column({ type: 'enum', enum: ['basic', 'professional', 'enterprise'], default: 'basic' })
  plan: 'basic' | 'professional' | 'enterprise';

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  features: {
    customBranding: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    auditLogs: boolean;
    ssoIntegration: boolean;
    customDomain: boolean;
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @OneToMany(() => OrganizationBranding, (branding) => branding.organization, { cascade: true })
  branding: OrganizationBranding[];

  @OneToMany(() => OrganizationUser, (user) => user.organization, { cascade: true })
  users: OrganizationUser[];

  @OneToMany(() => AuditLog, (log) => log.organization, { cascade: true })
  auditLogs: AuditLog[];
}