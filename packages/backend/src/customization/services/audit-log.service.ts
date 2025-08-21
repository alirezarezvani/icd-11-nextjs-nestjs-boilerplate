import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

export interface AuditLogData {
  organizationId: string;
  userId?: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed' | 'warning';
  errorMessage?: string;
  duration?: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   * @param data Audit log data
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        organizationId: data.organizationId,
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        metadata: data.metadata,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status || 'success',
        errorMessage: data.errorMessage,
        duration: data.duration,
      });

      await this.auditLogRepository.save(auditLog);
      
      this.logger.log(`Audit log created: ${data.action} on ${data.resource} by ${data.userEmail}`);
    } catch (error) {
      this.logger.error('Failed to create audit log', error.stack);
      // Don't throw error to avoid disrupting the main operation
    }
  }

  /**
   * Log a successful action
   * @param data Audit log data
   */
  async logSuccess(data: Omit<AuditLogData, 'status'>): Promise<void> {
    await this.log({ ...data, status: 'success' });
  }

  /**
   * Log a failed action
   * @param data Audit log data with error message
   */
  async logFailure(data: AuditLogData): Promise<void> {
    await this.log({ ...data, status: 'failed' });
  }

  /**
   * Log a warning action
   * @param data Audit log data
   */
  async logWarning(data: Omit<AuditLogData, 'status'>): Promise<void> {
    await this.log({ ...data, status: 'warning' });
  }

  /**
   * Get audit logs for an organization
   * @param organizationId Organization ID
   * @param limit Number of logs to retrieve
   * @param offset Offset for pagination
   * @param filters Additional filters
   */
  async getOrganizationLogs(
    organizationId: string,
    limit: number = 50,
    offset: number = 0,
    filters?: {
      action?: string;
      resource?: string;
      userId?: string;
      status?: 'success' | 'failed' | 'warning';
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('log')
        .where('log.organizationId = :organizationId', { organizationId })
        .orderBy('log.createdAt', 'DESC')
        .skip(offset)
        .take(limit);

      if (filters) {
        if (filters.action) {
          queryBuilder.andWhere('log.action = :action', { action: filters.action });
        }
        if (filters.resource) {
          queryBuilder.andWhere('log.resource = :resource', { resource: filters.resource });
        }
        if (filters.userId) {
          queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
        }
        if (filters.status) {
          queryBuilder.andWhere('log.status = :status', { status: filters.status });
        }
        if (filters.startDate) {
          queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
          queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
        }
      }

      const [logs, total] = await queryBuilder.getManyAndCount();
      
      return { logs, total };
    } catch (error) {
      this.logger.error('Failed to retrieve audit logs', error.stack);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  /**
   * Get audit log statistics for an organization
   * @param organizationId Organization ID
   * @param days Number of days to look back (default: 30)
   */
  async getOrganizationStats(
    organizationId: string,
    days: number = 30,
  ): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    warningActions: number;
    topActions: Array<{ action: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const totalActions = await this.auditLogRepository.count({
        where: {
          organizationId,
          createdAt: { $gte: startDate } as any,
        },
      });

      const successfulActions = await this.auditLogRepository.count({
        where: {
          organizationId,
          status: 'success',
          createdAt: { $gte: startDate } as any,
        },
      });

      const failedActions = await this.auditLogRepository.count({
        where: {
          organizationId,
          status: 'failed',
          createdAt: { $gte: startDate } as any,
        },
      });

      const warningActions = await this.auditLogRepository.count({
        where: {
          organizationId,
          status: 'warning',
          createdAt: { $gte: startDate } as any,
        },
      });

      // Get top actions
      const topActionsResult = await this.auditLogRepository
        .createQueryBuilder('log')
        .select('log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where('log.organizationId = :organizationId', { organizationId })
        .andWhere('log.createdAt >= :startDate', { startDate })
        .groupBy('log.action')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      const topActions = topActionsResult.map((row) => ({
        action: row.action,
        count: parseInt(row.count, 10),
      }));

      // Get top resources
      const topResourcesResult = await this.auditLogRepository
        .createQueryBuilder('log')
        .select('log.resource', 'resource')
        .addSelect('COUNT(*)', 'count')
        .where('log.organizationId = :organizationId', { organizationId })
        .andWhere('log.createdAt >= :startDate', { startDate })
        .groupBy('log.resource')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      const topResources = topResourcesResult.map((row) => ({
        resource: row.resource,
        count: parseInt(row.count, 10),
      }));

      return {
        totalActions,
        successfulActions,
        failedActions,
        warningActions,
        topActions,
        topResources,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve audit log statistics', error.stack);
      throw new Error('Failed to retrieve audit log statistics');
    }
  }
}