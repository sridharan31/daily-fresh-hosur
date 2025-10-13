// app/services/push/pushNotificationService.ts
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

// Web-safe AsyncStorage implementation
const AsyncStorage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

// Fallback interface if react-native-push-notification is not available
interface PushNotificationStatic {
  configure(options: any): void;
  localNotification(details: any): void;
  localNotificationSchedule(details: any): void;
  cancelLocalNotification(notificationId: string): void;
  cancelAllLocalNotifications(): void;
  createChannel(channelObj: any, callback?: (created: boolean) => void): void;
}

// Platform-aware PushNotification import
let PushNotification: PushNotificationStatic;

// Check if we're on web platform
const isWeb = typeof window !== 'undefined' && window.document;

if (isWeb) {
  // Web mock implementation
  PushNotification = {
    configure: () => {},
    localNotification: () => {},
    localNotificationSchedule: () => {},
    cancelLocalNotification: () => {},
    cancelAllLocalNotifications: () => {},
    createChannel: () => {},
  };
} else {
  // Try to import PushNotification for native platforms
  try {
    const PushNotificationModule = require('react-native-push-notification');
    PushNotification = PushNotificationModule?.default || PushNotificationModule;
    
    // If still undefined, use mock
    if (!PushNotification || typeof PushNotification.configure !== 'function') {
      throw new Error('PushNotification not properly loaded');
    }
  } catch (error) {
    console.warn('PushNotification not available, using mock:', error);
    // Mock implementation for development
    PushNotification = {
      configure: () => {},
      localNotification: () => {},
      localNotificationSchedule: () => {},
      cancelLocalNotification: () => {},
      cancelAllLocalNotifications: () => {},
      createChannel: () => {},
    };
  }
}

interface NotificationData {
  type?: string;
  orderId?: string;
  promotionId?: string;
  [key: string]: any;
}

interface RemoteMessage {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: NotificationData;
}

class PushNotificationService {
  constructor() {
    this.configure();
  }

  // Configure push notifications
  configure(): void {
    try {
      // Skip configuration on web platform
      if (isWeb) {
        console.log('Push notifications not available on web');
        return;
      }

      // Configure local notifications for native platforms
      if (PushNotification && typeof PushNotification.configure === 'function') {
        PushNotification.configure({
          // Called when a notification is clicked
          onNotification: (notification: any) => {
            console.log('Local notification clicked:', notification);
            this.handleNotificationClick(notification);
          },

          // Request permissions on iOS
          requestPermissions: Platform.OS === 'ios',
        });

        // Create notification channels for Android
        this.createChannels();
      }
    } catch (error) {
      console.warn('Error configuring push notifications:', error);
    }
  }

  // Request notification permissions
  async requestUserPermission(): Promise<boolean> {
    try {
      // Web platform - return false (no push notifications)
      if (isWeb) {
        console.log('Push notifications not supported on web');
        return false;
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      // iOS - use Firebase messaging
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      // Web platform - return null
      if (isWeb) {
        console.log('FCM token not available on web');
        return null;
      }

      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Store token locally (web-safe)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('fcm_token', token);
      } else if (!isWeb) {
        await AsyncStorage.setItem('fcm_token', token);
      }
      
      // Send token to backend
      await this.sendTokenToServer(token);
      
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Send token to backend
  async sendTokenToServer(token: string): Promise<void> {
    try {
      // This would integrate with your notification service
      console.log('Token sent to server:', token);
      // await notificationService.registerToken(token);
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Listen to foreground messages
  notificationListener() {
    // Skip on web platform
    if (isWeb) {
      console.log('Notification listeners not available on web');
      return;
    }

    try {
      // Foreground message handler
      messaging().onMessage(async remoteMessage => {
        console.log('Foreground notification:', remoteMessage);
        this.showLocalNotification(remoteMessage);
      });

      // Background/quit state message handler
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        this.handleNotificationClick(remoteMessage);
      });

      // App opened from quit state by notification
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('Initial notification:', remoteMessage);
            this.handleNotificationClick(remoteMessage);
          }
        });

      // Token refresh listener
      messaging().onTokenRefresh(token => {
        console.log('Token refreshed:', token);
        this.sendTokenToServer(token);
      });
    } catch (error) {
      console.warn('Error setting up notification listeners:', error);
    }
  }

  // Show local notification for foreground messages
  showLocalNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { notification, data } = remoteMessage;
    
    PushNotification.localNotification({
      title: notification?.title || 'New Notification',
      message: notification?.body || 'You have a new notification',
      playSound: true,
      soundName: 'default',
      actions: data?.actions ? JSON.parse(data.actions as string) : [],
      userInfo: data,
      category: data?.category,
    });
  }

  // Handle notification click
  handleNotificationClick(notification: any): void {
    const { data } = notification;
    
    if (data?.type) {
      switch (data.type) {
        case 'order_update':
          this.navigateToOrder(data.orderId);
          break;
        case 'delivery_update':
          this.navigateToTracking(data.orderId);
          break;
        case 'promotion':
          this.navigateToPromotion(data.promotionId);
          break;
        case 'slot_reminder':
          this.navigateToSlotSelection();
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    }
  }

  // Navigation helpers
  navigateToOrder(orderId: string): void {
    // Implementation depends on your navigation setup
    console.log('Navigate to order:', orderId);
  }

  navigateToTracking(orderId: string): void {
    console.log('Navigate to tracking:', orderId);
  }

  navigateToPromotion(promotionId: string): void {
    console.log('Navigate to promotion:', promotionId);
  }

  navigateToSlotSelection(): void {
    console.log('Navigate to slot selection');
  }

  // Create notification channels (Android)
  createChannels() {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'order-updates',
          channelName: 'Order Updates',
          channelDescription: 'Notifications about order status updates',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Order updates channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'delivery-updates',
          channelName: 'Delivery Updates',
          channelDescription: 'Notifications about delivery status',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Delivery updates channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'promotions',
          channelName: 'Promotions & Offers',
          channelDescription: 'Special offers and promotional notifications',
          playSound: false,
          importance: 3,
        },
        (created) => console.log(`Promotions channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'general',
          channelName: 'General Notifications',
          channelDescription: 'General app notifications',
          playSound: true,
          soundName: 'default',
          importance: 3,
        },
        (created) => console.log(`General channel created: ${created}`)
      );
    }
  }

  // Schedule local notification
  scheduleNotification(title: string, message: string, date: Date, data: Record<string, any> = {}): void {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      userInfo: data,
      playSound: true,
      soundName: 'default',
    });
  }

  // Cancel scheduled notification
  cancelNotification(notificationId: string): void {
    PushNotification.cancelLocalNotification(notificationId);
  }

  // Cancel all notifications
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  // Check notification settings
  async checkNotificationSettings(): Promise<boolean> {
    if (isWeb) {
      return false;
    }
    
    try {
      const enabled = await messaging().hasPermission();
      return enabled === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.warn('Error checking notification settings:', error);
      return false;
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic: string): Promise<void> {
    if (isWeb) {
      console.log(`Topic subscription not available on web: ${topic}`);
      return;
    }
    
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic: string): Promise<void> {
    if (isWeb) {
      console.log(`Topic unsubscription not available on web: ${topic}`);
      return;
    }
    
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }
}

export default new PushNotificationService();

