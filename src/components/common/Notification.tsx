import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { NotificationState, NotificationType } from '../../hooks/useNotification';

interface NotificationProps {
  notification: NotificationState;
}

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#4CAF50',
        borderColor: '#45a049',
      };
    case 'error':
      return {
        backgroundColor: '#f44336',
        borderColor: '#da190b',
      };
    case 'warning':
      return {
        backgroundColor: '#ff9800',
        borderColor: '#e68900',
      };
    case 'info':
    default:
      return {
        backgroundColor: '#2196F3',
        borderColor: '#0b7dda',
      };
  }
};

export const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification.visible) return null;

  const notificationStyles = getNotificationStyles(notification.type);

  return (
    <Animated.View
      style={[
        styles.notification,
        notificationStyles,
        { opacity: notification.fadeAnim }
      ]}
    >
      <Text style={styles.notificationText}>{notification.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

// Default export for Expo Router compatibility
export default Notification;