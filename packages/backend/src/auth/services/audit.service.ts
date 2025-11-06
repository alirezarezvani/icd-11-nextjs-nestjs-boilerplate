import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';

export interface AuditLogParams {
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed' | 'warning';
  errorMessage?: string;
  metadata?: Record<string, any>;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(params: AuditLogParams): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId: params.userId,
      userEmail: params.userEmail,
      organizationId: params.organizationId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: params.status || 'success',
      errorMessage: params.errorMessage,
      metadata: params.metadata,
      changes: params.changes,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async getAuthenticationLogs(
    userId?: string,
    organizationId?: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query = this.auditLogRepository.createQueryBuilder('log')
      .where('log.action IN (:...authActions)', {
        authActions: [
          AuditAction.LOGIN,
          AuditAction.LOGOUT,
          AuditAction.REGISTER,
          AuditAction.FAILED_LOGIN,
          AuditAction.ACCOUNT_LOCKED,
          AuditAction.ACCOUNT_UNLOCKED,
        ],
      })
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }

    if (organizationId) {
      query.andWhere('log.organizationId = :organizationId', { organizationId });
    }

    const [logs, total] = await query.getManyAndCount();
    return { logs, total };
  }

  async getSecurityEvents(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('log')
      .where('log.action IN (:...securityActions)', {
        securityActions: [
          AuditAction.FAILED_LOGIN,
          AuditAction.ACCOUNT_LOCKED,
          AuditAction.PASSWORD_CHANGE,
          AuditAction.PASSWORD_RESET,
          AuditAction.ROLE_CHANGE,
        ],
      })
      .orderBy('log.createdAt', 'DESC')
      .limit(limit);

    if (organizationId) {
      query.andWhere('log.organizationId = :organizationId', { organizationId });
    }

    if (startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async getFailedLoginAttempts(
    email?: string,
    ipAddress?: string,
    timeWindowHours: number = 24,
  ): Promise<number> {
    const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    
    const query = this.auditLogRepository.createQueryBuilder('log')
      .where('log.action = :action', { action: AuditAction.FAILED_LOGIN })
      .andWhere('log.createdAt >= :since', { since });

    if (email) {
      query.andWhere('log.userEmail = :email', { email });
    }

    if (ipAddress) {
      query.andWhere('log.ipAddress = :ipAddress', { ipAddress });
    }

    return query.getCount();
  }

  // Helper method to log authentication events with context
  async logAuthEvent(
    action: AuditAction,
    userId: string,
    userEmail: string,
    organizationId?: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    return this.createLog({
      userId,
      userEmail,
      organizationId,
      action,
      ipAddress,
      userAgent,
      status: success ? 'success' : 'failed',
      metadata,
    });
  }
}