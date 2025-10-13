import { useState } from 'react';
import { Animated } from 'react-native';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationState {
  visible: boolean;
  message: string;
  type: NotificationType;
  fadeAnim: Animated.Value;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    message: '',
    type: 'info',
    fadeAnim: new Animated.Value(0),
  });

  const showNotification = (message: string, type: NotificationType = 'info', duration: number = 3000) => {
    setNotification(prev => ({
      ...prev,
      visible: true,
      message,
      type,
    }));

    // Fade in animation
    Animated.timing(notification.fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after duration
    setTimeout(() => {
      Animated.timing(notification.fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setNotification(prev => ({
          ...prev,
          visible: false,
        }));
      });
    }, duration);
  };

  const hideNotification = () => {
    Animated.timing(notification.fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotification(prev => ({
        ...prev,
        visible: false,
      }));
    });
  };

  const showSuccess = (message: string, duration?: number) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    showNotification(message, 'error', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showNotification(message, 'info', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showNotification(message, 'warning', duration);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
