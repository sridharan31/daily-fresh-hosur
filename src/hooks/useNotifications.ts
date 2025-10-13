import { useCallback, useEffect, useState } from 'react';
import pushNotificationService from '../../lib/services/push/pushNotificationService';

// Simple notification settings interface
interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
}

type NotificationType = 'order' | 'promotion' | 'delivery' | 'general';

interface UseNotificationsReturn {
  settings: NotificationSettings;
  loading: boolean;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  badgeCount: number;
  clearBadge: () => Promise<void>;
  addHandler: (type: NotificationType, handler: (data: any) => void) => void;
  removeHandler: (type: NotificationType, handler: (data: any) => void) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    sound: true,
    vibration: true,
  });
  const [loading, setLoading] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    // Load current settings and badge count
    loadSettings();
    loadBadgeCount();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await pushNotificationService.checkNotificationSettings();
      setSettings(prev => ({ ...prev, enabled }));
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadBadgeCount = async () => {
    try {
      // Badge count not directly available, set to 0 for now
      setBadgeCount(0);
    } catch (error) {
      console.error('Error loading badge count:', error);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    setLoading(true);
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      // Note: Actual service doesn't have updateNotificationSettings method
      console.log('Notification settings updated:', newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await pushNotificationService.requestUserPermission();
      if (granted) {
        setSettings(prev => ({ ...prev, enabled: true }));
      }
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      // Create a mock remote message for testing
      const mockMessage = {
        messageId: 'test-' + Date.now(),
        data: { type: 'general' },
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification',
        },
        from: 'test',
        sentTime: Date.now(),
        ttl: 3600,
        fcmOptions: {},
        toJSON: () => ({}),
      };
      pushNotificationService.showLocalNotification(mockMessage);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, []);

  const clearBadge = useCallback(async (): Promise<void> => {
    try {
      setBadgeCount(0);
      // Note: Actual service doesn't have clearBadge method
      console.log('Badge cleared');
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }, []);

  const addHandler = useCallback((type: NotificationType, handler: (data: any) => void) => {
    // Note: Actual service doesn't have handler management
    console.log(`Handler added for ${type}`);
  }, []);

  const removeHandler = useCallback((type: NotificationType, handler: (data: any) => void) => {
    // Note: Actual service doesn't have handler management
    console.log(`Handler removed for ${type}`);
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    requestPermissions,
    sendTestNotification,
    badgeCount,
    clearBadge,
    addHandler,
    removeHandler,
  };
};

// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
