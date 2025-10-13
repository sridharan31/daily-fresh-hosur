// app/services/admin/auditService.ts
interface AdminAuditLog {
  timestamp: Date;
  adminId: string;
  adminEmail: string;
  action: AdminAction;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  result: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
  sessionId?: string;
}

type AdminAction = 
  // Authentication actions
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET'
  | '2FA_SETUP' | '2FA_DISABLE' | '2FA_VERIFY_SUCCESS' | '2FA_VERIFY_FAILED'
  
  // User management actions
  | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_ACTIVATE' | 'USER_DEACTIVATE'
  | 'PERMISSION_GRANT' | 'PERMISSION_REVOKE' | 'ROLE_ASSIGN' | 'ROLE_REMOVE'
  
  // Product management actions
  | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE' | 'PRODUCT_PUBLISH' | 'PRODUCT_UNPUBLISH'
  | 'INVENTORY_UPDATE' | 'PRICE_CHANGE' | 'BULK_UPDATE'
  
  // Order management actions
  | 'ORDER_UPDATE' | 'ORDER_CANCEL' | 'ORDER_REFUND' | 'ORDER_STATUS_CHANGE'
  | 'DELIVERY_ASSIGN' | 'DELIVERY_UPDATE'
  
  // System actions
  | 'SETTINGS_UPDATE' | 'SYSTEM_BACKUP' | 'DATA_EXPORT' | 'DATA_IMPORT'
  | 'PROMOTION_CREATE' | 'PROMOTION_UPDATE' | 'PROMOTION_DELETE';

interface AuditFilters {
  adminId?: string;
  action?: AdminAction;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  result?: 'SUCCESS' | 'FAILURE';
  limit?: number;
  offset?: number;
}

interface SecurityAlert {
  type: 'FAILED_LOGIN_ATTEMPTS' | 'SUSPICIOUS_ACTIVITY' | 'UNAUTHORIZED_ACCESS' | 'BULK_CHANGES';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  adminId: string;
  description: string;
  timestamp: Date;
  details: Record<string, any>;
}

class AuditService {
  private static instance: AuditService;
  private auditLogs: AdminAuditLog[] = [];
  private securityAlerts: SecurityAlert[] = [];

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an admin action for audit trail
   */
  async logAction(logData: Omit<AdminAuditLog, 'timestamp'>): Promise<void> {
    try {
      const auditLog: AdminAuditLog = {
        ...logData,
        timestamp: new Date(),
      };

      // Store locally for now (in production, send to backend)
      this.auditLogs.unshift(auditLog);

      // Check for security alerts
      await this.checkForSecurityAlerts(auditLog);

      // In production, send to backend API
      // await this.sendToBackend(auditLog);
      
      console.log('Audit Log:', auditLog);
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  /**
   * Retrieve audit logs with filters
   */
  async getAuditLogs(filters: AuditFilters = {}): Promise<AdminAuditLog[]> {
    try {
      let filteredLogs = [...this.auditLogs];

      // Apply filters
      if (filters.adminId) {
        filteredLogs = filteredLogs.filter(log => log.adminId === filters.adminId);
      }

      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }

      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }

      if (filters.result) {
        filteredLogs = filteredLogs.filter(log => log.result === filters.result);
      }

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;

      return filteredLogs.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Get security alerts
   */
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    return [...this.securityAlerts];
  }

  /**
   * Check for potential security issues and create alerts
   */
  private async checkForSecurityAlerts(auditLog: AdminAuditLog): Promise<void> {
    try {
      // Check for multiple failed login attempts
      if (auditLog.action === 'LOGIN_FAILED') {
        const recentFailedLogins = this.auditLogs.filter(log => 
          log.adminId === auditLog.adminId &&
          log.action === 'LOGIN_FAILED' &&
          log.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        );

        if (recentFailedLogins.length >= 3) {
          await this.createSecurityAlert({
            type: 'FAILED_LOGIN_ATTEMPTS',
            severity: 'HIGH',
            adminId: auditLog.adminId,
            description: `Multiple failed login attempts detected for admin ${auditLog.adminEmail}`,
            timestamp: new Date(),
            details: {
              attemptCount: recentFailedLogins.length,
              ipAddress: auditLog.ipAddress,
              timeWindow: '15 minutes'
            }
          });
        }
      }

      // Check for bulk changes
      if (auditLog.action === 'BULK_UPDATE') {
        const details = auditLog.details;
        if (details && details.itemCount > 100) {
          await this.createSecurityAlert({
            type: 'BULK_CHANGES',
            severity: 'MEDIUM',
            adminId: auditLog.adminId,
            description: `Large bulk update performed by ${auditLog.adminEmail}`,
            timestamp: new Date(),
            details: {
              resource: auditLog.resource,
              itemCount: details.itemCount,
              operation: details.operation
            }
          });
        }
      }

      // Check for suspicious activity patterns
      const recentActions = this.auditLogs.filter(log => 
        log.adminId === auditLog.adminId &&
        log.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
      );

      if (recentActions.length > 100) {
        await this.createSecurityAlert({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          adminId: auditLog.adminId,
          description: `Unusually high activity detected for admin ${auditLog.adminEmail}`,
          timestamp: new Date(),
          details: {
            actionCount: recentActions.length,
            timeWindow: '1 hour',
            mostCommonAction: this.getMostCommonAction(recentActions)
          }
        });
      }
    } catch (error) {
      console.error('Failed to check for security alerts:', error);
    }
  }

  /**
   * Create a security alert
   */
  private async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    this.securityAlerts.unshift(alert);
    
    // Keep only the last 100 alerts
    if (this.securityAlerts.length > 100) {
      this.securityAlerts = this.securityAlerts.slice(0, 100);
    }

    // In production, send notification to security team
    console.warn('Security Alert:', alert);
  }

  /**
   * Get the most common action from a list of audit logs
   */
  private getMostCommonAction(logs: AdminAuditLog[]): AdminAction {
    const actionCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return Object.keys(actionCounts).reduce((a, b) => 
      actionCounts[a] > actionCounts[b] ? a : b
    ) as AdminAction;
  }

  /**
   * Export audit logs for compliance reporting
   */
  async exportAuditLogs(filters: AuditFilters = {}): Promise<string> {
    try {
      const logs = await this.getAuditLogs(filters);
      
      // Convert to CSV format for export
      const headers = [
        'Timestamp',
        'Admin ID',
        'Admin Email',
        'Action',
        'Resource',
        'Resource ID',
        'IP Address',
        'Result',
        'Details'
      ];

      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.adminId,
          log.adminEmail,
          log.action,
          log.resource,
          log.resourceId || '',
          log.ipAddress,
          log.result,
          JSON.stringify(log.details || {}).replace(/"/g, '""')
        ].join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  /**
   * Get audit statistics for dashboard
   */
  async getAuditStatistics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    uniqueAdmins: number;
    topActions: { action: AdminAction; count: number }[];
    securityAlerts: number;
  }> {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const filteredLogs = this.auditLogs.filter(log => log.timestamp >= startDate);
      
      const uniqueAdmins = new Set(filteredLogs.map(log => log.adminId)).size;
      const successfulActions = filteredLogs.filter(log => log.result === 'SUCCESS').length;
      const failedActions = filteredLogs.filter(log => log.result === 'FAILURE').length;
      
      // Get top actions
      const actionCounts: Record<string, number> = {};
      filteredLogs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });
      
      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action: action as AdminAction, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const recentAlerts = this.securityAlerts.filter(alert => alert.timestamp >= startDate);

      return {
        totalActions: filteredLogs.length,
        successfulActions,
        failedActions,
        uniqueAdmins,
        topActions,
        securityAlerts: recentAlerts.length
      };
    } catch (error) {
      console.error('Failed to get audit statistics:', error);
      return {
        totalActions: 0,
        successfulActions: 0,
        failedActions: 0,
        uniqueAdmins: 0,
        topActions: [],
        securityAlerts: 0
      };
    }
  }

  /**
   * Clear old audit logs (for maintenance)
   */
  async clearOldLogs(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
      this.securityAlerts = this.securityAlerts.filter(alert => alert.timestamp >= cutoffDate);
      
      console.log(`Cleared audit logs older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }
}

export default AuditService;
export type { AdminAction, AdminAuditLog, AuditFilters, SecurityAlert };
