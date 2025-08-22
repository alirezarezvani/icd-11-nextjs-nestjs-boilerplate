import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Organization } from "./organization.entity";

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  PROFILE_UPDATE = 'profile_update',
  ROLE_CHANGE = 'role_change',
  ORGANIZATION_JOIN = 'organization_join',
  ORGANIZATION_LEAVE = 'organization_leave',
  ICD_SEARCH = 'icd_search',
  ICD_VIEW = 'icd_view',
  DATA_EXPORT = 'data_export',
  SETTINGS_CHANGE = 'settings_change',
  FILE_UPLOAD = 'file_upload',
  FILE_DELETE = 'file_delete',
  FAILED_LOGIN = 'failed_login',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  // Organization Branding Actions
  BRANDING_CREATE = 'branding_create',
  BRANDING_UPDATE = 'branding_update',
  BRANDING_DELETE = 'branding_delete',
  BRANDING_RESET = 'reset_branding',
  BRANDING_VIEW = 'branding_view',
  BRANDING_EXPORT = 'branding_export',
  // Organization Management Actions
  ORGANIZATION_CREATE = 'organization_create',
  ORGANIZATION_UPDATE = 'organization_update',
  ORGANIZATION_DELETE = 'organization_delete',
  ORGANIZATION_VIEW = 'organization_view',
}

@Entity("audit_logs")
@Index(["organizationId", "action"])
@Index(["organizationId", "createdAt"])
@Index(["userId", "createdAt"])
@Index(["action"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: true })
  organizationId: string;

  @Column({ type: "uuid", nullable: true })
  userId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  userEmail: string;

  @Column({ 
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: "varchar", length: 100, nullable: true })
  resource: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  resourceId: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };

  @Column({ type: "varchar", length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: "text", nullable: true })
  userAgent: string;

  @Column({ type: "varchar", length: 50, default: "success" })
  status: "success" | "failed" | "warning";

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @Column({ type: "integer", nullable: true })
  duration: number; // in milliseconds

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.auditLogs, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  // Helper method for authentication events
  static createAuthEvent(params: {
    userId?: string;
    userEmail?: string;
    organizationId?: string;
    action: AuditAction;
    ipAddress?: string;
    userAgent?: string;
    status?: "success" | "failed" | "warning";
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): AuditLog {
    const log = new AuditLog();
    Object.assign(log, params);
    return log;
  }
}
