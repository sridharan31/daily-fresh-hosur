// app/services/admin/sessionService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuditService from './auditService';

interface AdminSession {
  sessionId: string;
  adminId: string;
  adminEmail: string;
  startTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  deviceInfo?: {
    platform: string;
    model?: string;
    version?: string;
  };
}

interface SessionConfig {
  sessionTimeout: number; // in minutes
  maxConcurrentSessions: number;
  requireReauthForSensitiveActions: boolean;
  sessionWarningTime: number; // warn before timeout (in minutes)
}

class AdminSessionService {
  private static instance: AdminSessionService;
  private currentSession: AdminSession | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private auditService = AuditService.getInstance();
  
  private config: SessionConfig = {
    sessionTimeout: 30, // 30 minutes
    maxConcurrentSessions: 3,
    requireReauthForSensitiveActions: true,
    sessionWarningTime: 5, // 5 minutes before timeout
  };

  public static getInstance(): AdminSessionService {
    if (!AdminSessionService.instance) {
      AdminSessionService.instance = new AdminSessionService();
    }
    return AdminSessionService.instance;
  }

  /**
   * Start a new admin session
   */
  async startSession(adminId: string, adminEmail: string): Promise<AdminSession> {
    try {
      const sessionId = this.generateSessionId();
      const now = new Date();
      
      const session: AdminSession = {
        sessionId,
        adminId,
        adminEmail,
        startTime: now,
        lastActivity: now,
        ipAddress: await this.getClientIP(),
        userAgent: this.getUserAgent(),
        isActive: true,
        deviceInfo: await this.getDeviceInfo(),
      };

      // Store current session
      this.currentSession = session;
      
      // Save to local storage
      await AsyncStorage.setItem('admin_session', JSON.stringify(session));
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      // Log session start
      await this.auditService.logAction({
        adminId,
        adminEmail,
        action: 'LOGIN',
        resource: 'AUTH',
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        result: 'SUCCESS',
        details: {
          sessionId,
          deviceInfo: session.deviceInfo,
        },
        sessionId,
      });

      console.log('Admin session started:', sessionId);
      return session;
    } catch (error) {
      console.error('Failed to start admin session:', error);
      throw new Error('Failed to start session');
    }
  }

  /**
   * End the current admin session
   */
  async endSession(reason: 'LOGOUT' | 'TIMEOUT' | 'FORCED' = 'LOGOUT'): Promise<void> {
    try {
      if (!this.currentSession) {
        return;
      }

      const session = this.currentSession;
      session.isActive = false;

      // Log session end
      await this.auditService.logAction({
        adminId: session.adminId,
        adminEmail: session.adminEmail,
        action: 'LOGOUT',
        resource: 'AUTH',
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        result: 'SUCCESS',
        details: {
          sessionId: session.sessionId,
          reason,
          duration: Date.now() - session.startTime.getTime(),
        },
        sessionId: session.sessionId,
      });

      // Clear session data
      this.currentSession = null;
      await AsyncStorage.removeItem('admin_session');
      
      // Stop session monitoring
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      console.log('Admin session ended:', session.sessionId, 'Reason:', reason);
    } catch (error) {
      console.error('Failed to end admin session:', error);
    }
  }

  /**
   * Update session activity (extend session)
   */
  async updateActivity(): Promise<void> {
    try {
      if (!this.currentSession) {
        return;
      }

      this.currentSession.lastActivity = new Date();
      
      // Update stored session
      await AsyncStorage.setItem('admin_session', JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  /**
   * Check if current session is valid
   */
  async isSessionValid(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        // Try to restore from storage
        const storedSession = await AsyncStorage.getItem('admin_session');
        if (storedSession) {
          this.currentSession = JSON.parse(storedSession);
          this.currentSession!.lastActivity = new Date(this.currentSession!.lastActivity);
          this.currentSession!.startTime = new Date(this.currentSession!.startTime);
        } else {
          return false;
        }
      }

      if (!this.currentSession) {
        return false;
      }

      const now = new Date();
      const timeSinceLastActivity = now.getTime() - this.currentSession.lastActivity.getTime();
      const timeoutMs = this.config.sessionTimeout * 60 * 1000;

      if (timeSinceLastActivity > timeoutMs) {
        await this.endSession('TIMEOUT');
        return false;
      }

      return this.currentSession.isActive;
    } catch (error) {
      console.error('Failed to check session validity:', error);
      return false;
    }
  }

  /**
   * Get current session info
   */
  getCurrentSession(): AdminSession | null {
    return this.currentSession;
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(): number {
    if (!this.currentSession) {
      return 0;
    }

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.currentSession.lastActivity.getTime();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;
    
    return Math.max(0, timeoutMs - timeSinceLastActivity);
  }

  /**
   * Check if session warning should be shown
   */
  shouldShowSessionWarning(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    const warningTimeMs = this.config.sessionWarningTime * 60 * 1000;
    
    return timeUntilExpiry > 0 && timeUntilExpiry <= warningTimeMs;
  }

  /**
   * Extend current session
   */
  async extendSession(): Promise<void> {
    try {
      if (!this.currentSession) {
        throw new Error('No active session to extend');
      }

      await this.updateActivity();
      
      // Log session extension
      await this.auditService.logAction({
        adminId: this.currentSession.adminId,
        adminEmail: this.currentSession.adminEmail,
        action: 'LOGIN',
        resource: 'AUTH',
        ipAddress: this.currentSession.ipAddress,
        userAgent: this.currentSession.userAgent,
        result: 'SUCCESS',
        details: {
          sessionId: this.currentSession.sessionId,
          action: 'SESSION_EXTENDED',
        },
        sessionId: this.currentSession.sessionId,
      });

      console.log('Session extended for:', this.currentSession.adminEmail);
    } catch (error) {
      console.error('Failed to extend session:', error);
      throw error;
    }
  }

  /**
   * Validate session for sensitive actions
   */
  async validateForSensitiveAction(action: string): Promise<boolean> {
    try {
      if (!this.config.requireReauthForSensitiveActions) {
        return true;
      }

      const isValid = await this.isSessionValid();
      if (!isValid) {
        return false;
      }

      // Check if recent authentication is required for sensitive actions
      const sensitiveActions = [
        'USER_DELETE',
        'PERMISSION_GRANT',
        'PERMISSION_REVOKE',
        'BULK_UPDATE',
        '2FA_DISABLE',
        'SYSTEM_BACKUP',
        'DATA_EXPORT'
      ];

      if (sensitiveActions.includes(action)) {
        // Require re-authentication within last 5 minutes for sensitive actions
        const now = new Date();
        const timeSinceLastActivity = now.getTime() - this.currentSession!.lastActivity.getTime();
        const recentAuthRequired = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastActivity > recentAuthRequired) {
          // Log security check
          await this.auditService.logAction({
            adminId: this.currentSession!.adminId,
            adminEmail: this.currentSession!.adminEmail,
            action: 'LOGIN_FAILED',
            resource: 'SECURITY',
            ipAddress: this.currentSession!.ipAddress,
            userAgent: this.currentSession!.userAgent,
            result: 'FAILURE',
            details: {
              attemptedAction: action,
              reason: 'RECENT_AUTH_REQUIRED',
              timeSinceLastActivity: timeSinceLastActivity,
            },
            sessionId: this.currentSession!.sessionId,
          });

          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to validate session for sensitive action:', error);
      return false;
    }
  }

  /**
   * Start monitoring session timeout
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.isSessionValid();
      if (!isValid) {
        // Session expired, clean up
        if (this.sessionCheckInterval) {
          clearInterval(this.sessionCheckInterval);
          this.sessionCheckInterval = null;
        }
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP address (mock implementation)
   */
  private async getClientIP(): Promise<string> {
    // In a real app, you'd get this from the network request or a service
    return '127.0.0.1';
  }

  /**
   * Get user agent string
   */
  private getUserAgent(): string {
    // In a real app, you'd get this from the platform info
    return `GroceryAdmin/1.0.0`;
  }

  /**
   * Get device information
   */
  private async getDeviceInfo(): Promise<AdminSession['deviceInfo']> {
    // In a real app, you'd use react-native-device-info or similar
    return {
      platform: 'web',
      model: 'Browser',
      version: '1.0.0',
    };
  }

  /**
   * Update session configuration
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current session configuration
   */
  getConfig(): SessionConfig {
    return { ...this.config };
  }
}

export default AdminSessionService;
export type { AdminSession, SessionConfig };
