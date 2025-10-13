 // app/services/api/notificationService.ts
import { API_ENDPOINTS } from '../../../src/config/apiConfig';
import { ApiResponse, Pagination } from '../../types/api';
import apiClient from './apiClient';

interface NotificationSettings {
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  paymentUpdates: boolean;
  general: boolean;
  slotReminders: boolean;
  marketing: boolean;
  newsletter: boolean;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface SendNotificationRequest {
  title: string;
  body: string;
  type: string;
  data?: any;
  targetAudience?: {
    userIds?: string[];
    segments?: string[];
    all?: boolean;
  };
  scheduledFor?: string;
  channels?: Array<'push' | 'email' | 'sms'>;
}

interface NotificationAnalytics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  byChannel: Array<{
    channel: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
}

class NotificationService {
  // Device Registration
  async registerDevice(token: string, platform: string, deviceInfo?: {
    deviceId: string;
    appVersion: string;
    osVersion: string;
  }): Promise<ApiResponse<{deviceId: string}>> {
    return await apiClient.post<{deviceId: string}>(API_ENDPOINTS.REGISTER_DEVICE, {
      token,
      platform,
      ...deviceInfo,
    });
  }

  async unregisterDevice(deviceId?: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.delete<{message: string}>(
      deviceId ? `${API_ENDPOINTS.UNREGISTER_DEVICE}/${deviceId}` : API_ENDPOINTS.UNREGISTER_DEVICE
    );
  }

  async updateDeviceToken(newToken: string, deviceId?: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.patch<{message: string}>(
      `${API_ENDPOINTS.REGISTER_DEVICE}${deviceId ? `/${deviceId}` : ''}`, 
      {token: newToken}
    );
  }

  // Notification Preferences
  async getNotificationPreferences(): Promise<ApiResponse<NotificationSettings>> {
    return await apiClient.get<NotificationSettings>(API_ENDPOINTS.NOTIFICATION_PREFERENCES);
  }

  async updateNotificationPreferences(preferences: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    return await apiClient.patch<NotificationSettings>(API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCES, preferences);
  }

  async getChannelPreferences(): Promise<ApiResponse<{
    push: boolean;
    email: boolean;
    sms: boolean;
    preferences: NotificationSettings;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/channels`);
  }

  async updateChannelPreferences(channels: {push?: boolean; email?: boolean; sms?: boolean}): Promise<ApiResponse<{message: string}>> {
    return await apiClient.patch<{message: string}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/channels`, channels);
  }

  // Notification Management
  async getNotifications(
    page: number = 1, 
    limit: number = 20, 
    filters?: {
      type?: string;
      isRead?: boolean;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<ApiResponse<{notifications: Notification[]; pagination: Pagination; unreadCount: number}>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/history?${queryParams.toString()}`;
    return await apiClient.get<{notifications: Notification[]; pagination: Pagination; unreadCount: number}>(url);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.patch<{message: string}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{message: string; markedCount: number}>> {
    return await apiClient.patch<{message: string; markedCount: number}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/read-all`);
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.delete<{message: string}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/${notificationId}`);
  }

  async clearAllNotifications(): Promise<ApiResponse<{message: string; deletedCount: number}>> {
    return await apiClient.delete<{message: string; deletedCount: number}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/clear-all`);
  }

  async getUnreadCount(): Promise<ApiResponse<{count: number}>> {
    return await apiClient.get<{count: number}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/unread-count`);
  }

  // Notification Templates (for admin use)
  async getNotificationTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: string;
    title: string;
    body: string;
    variables: string[];
    isActive: boolean;
  }>>> {
    return await apiClient.get(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/templates`);
  }

  // Scheduled Notifications
  async scheduleNotification(notification: {
    title: string;
    body: string;
    type: string;
    scheduledFor: string;
    data?: any;
  }): Promise<ApiResponse<{scheduledNotificationId: string}>> {
    return await apiClient.post<{scheduledNotificationId: string}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/schedule`, notification);
  }

  async cancelScheduledNotification(scheduledNotificationId: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.delete<{message: string}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/schedule/${scheduledNotificationId}`);
  }

  async getScheduledNotifications(): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    scheduledFor: string;
    status: 'pending' | 'sent' | 'cancelled';
    createdAt: string;
  }>>> {
    return await apiClient.get(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/scheduled`);
  }

  // Admin Notification Functions
  async sendNotificationToUser(userId: string, notification: {
    title: string;
    body: string;
    type: string;
    data?: any;
    channels?: Array<'push' | 'email' | 'sms'>;
  }): Promise<ApiResponse<{messageId: string; deliveryStatus: any}>> {
    return await apiClient.post<{messageId: string; deliveryStatus: any}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/send-to-user/${userId}`, notification);
  }

  async sendBulkNotification(notification: SendNotificationRequest): Promise<ApiResponse<{
    campaignId: string;
    targetCount: number;
    estimatedDeliveryTime: string;
  }>> {
    return await apiClient.post<{
      campaignId: string;
      targetCount: number;
      estimatedDeliveryTime: string;
    }>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/send-bulk`, notification);
  }

  async getNotificationCampaigns(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    campaigns: Array<{
      id: string;
      title: string;
      type: string;
      targetCount: number;
      sentCount: number;
      deliveredCount: number;
      openedCount: number;
      status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
      createdAt: string;
      sentAt?: string;
    }>;
    pagination: Pagination;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/campaigns?page=${page}&limit=${limit}`);
  }

  async getCampaignAnalytics(campaignId: string): Promise<ApiResponse<NotificationAnalytics>> {
    return await apiClient.get<NotificationAnalytics>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/campaigns/${campaignId}/analytics`);
  }

  // Push notification testing
  async sendTestNotification(notification: {
    title: string;
    body: string;
    type: string;
    data?: any;
  }): Promise<ApiResponse<{message: string; deliveryStatus: any}>> {
    return await apiClient.post<{message: string; deliveryStatus: any}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/test`, notification);
  }

  // Notification analytics
  async getNotificationAnalytics(
    dateFrom?: string, 
    dateTo?: string
  ): Promise<ApiResponse<{
    totalNotifications: number;
    deliveredNotifications: number;
    openedNotifications: number;
    clickedNotifications: number;
    byType: Array<{type: string; count: number; openRate: number}>;
    byChannel: Array<{channel: string; sent: number; delivered: number; opened: number}>;
    engagement: {
      averageOpenRate: number;
      averageClickRate: number;
      bestPerformingType: string;
      worstPerformingType: string;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const url = `${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get(url);
  }

  // Notification status tracking
  async trackNotificationAction(notificationId: string, action: 'opened' | 'clicked' | 'dismissed', metadata?: any): Promise<ApiResponse<{message: string}>> {
    return await apiClient.post<{message: string}>(`${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/${notificationId}/track`, {
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }
}

export default new NotificationService();
