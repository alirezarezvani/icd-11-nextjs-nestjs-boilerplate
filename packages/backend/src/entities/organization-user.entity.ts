import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Organization } from "./organization.entity";

@Entity("organization_users")
@Index(["organizationId", "email"], { unique: true })
export class OrganizationUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255 })
  firstName: string;

  @Column({ type: "varchar", length: 255 })
  lastName: string;

  @Column({
    type: "enum",
    enum: ["admin", "editor", "viewer"],
    default: "viewer",
  })
  role: "admin" | "editor" | "viewer";

  @Column({ type: "jsonb", nullable: true })
  permissions: {
    manageUsers: boolean;
    manageBranding: boolean;
    manageSettings: boolean;
    viewAuditLogs: boolean;
    exportData: boolean;
  };

  @Column({
    type: "enum",
    enum: ["active", "inactive", "pending"],
    default: "pending",
  })
  status: "active" | "inactive" | "pending";

  @Column({ type: "timestamp with time zone", nullable: true })
  lastLoginAt: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  invitedBy: string;

  @Column({ type: "timestamp with time zone", nullable: true })
  invitedAt: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "organizationId" })
  organization: Organization;
}
