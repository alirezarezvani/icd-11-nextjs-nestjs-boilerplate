import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

/**
 * Initial authentication schema migration
 * Creates tables for Phase 3A: JWT Authentication System
 */
export class InitialAuthSchema1703776800000 implements MigrationInterface {
  name = 'InitialAuthSchema1703776800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'text',
            isNullable: false,
            comment: 'Scrypt-hashed password',
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['super_admin', 'org_admin', 'healthcare_provider', 'user'],
            default: "'user'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'locked', 'pending_verification'],
            default: "'pending_verification'",
            isNullable: false,
          },
          {
            name: 'organizationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'failedLoginAttempts',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'accountLockedUntil',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'lastLoginIp',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'emailVerificationToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'emailVerifiedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'passwordResetToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'passwordResetTokenExpiresAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create refresh_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'revokedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'revokedByIp',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'createdByIp',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create organizations table (for Phase 3B)
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['hospital', 'clinic', 'practice', 'research', 'government', 'other'],
            default: "'clinic'",
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '2',
            isNullable: false,
            comment: 'ISO 3166-1 alpha-2 country code',
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'organizationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'userEmail',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'resourceId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'changes',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'success'",
            isNullable: false,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: true,
            comment: 'Duration in milliseconds',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for performance using raw SQL
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_organization" ON "users" ("organizationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user" ON "refresh_tokens" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_expires" ON "refresh_tokens" ("expiresAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_revoked" ON "refresh_tokens" ("revoked")`);
    
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_organization_action" ON "audit_logs" ("organizationId", "action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_organization_created" ON "audit_logs" ("organizationId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_created" ON "audit_logs" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens" 
      ADD CONSTRAINT "FK_refresh_tokens_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_organization" 
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs" 
      ADD CONSTRAINT "FK_audit_logs_organization" 
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Create updated_at trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply updated_at triggers
    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON "organizations"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create RLS (Row Level Security) policies for HIPAA compliance
    await queryRunner.query(`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;`);

    // Create default admin user (for initial setup)
    await queryRunner.query(`
      INSERT INTO "organizations" ("id", "name", "type", "country", "isActive")
      VALUES ('00000000-0000-0000-0000-000000000001', 'System Administration', 'government', 'US', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_organizations_updated_at ON "organizations";`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users";`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_organization";`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_organization";`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_refresh_tokens_user";`);

    // Drop tables in reverse order
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('organizations');
  }
}