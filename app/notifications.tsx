import { router } from 'expo-router';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';

// Web-compatible CSS
if (typeof window !== 'undefined') {
  require('../global.css');
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'system' | 'delivery';
  timestamp: string;
  read: boolean;
  icon: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Order Delivered',
    message: 'Your order #12345 has been delivered successfully!',
    type: 'delivery',
    timestamp: '2 hours ago',
    read: false,
    icon: '🚚'
  },
  {
    id: '2',
    title: 'Special Offer',
    message: '20% off on fresh fruits today only!',
    type: 'offer',
    timestamp: '1 day ago',
    read: false,
    icon: '🎉'
  },
  {
    id: '3',
    title: 'Order Confirmed',
    message: 'Your order #12344 has been confirmed and is being prepared.',
    type: 'order',
    timestamp: '2 days ago',
    read: true,
    icon: '✅'
  },
  {
    id: '4',
    title: 'New Features',
    message: 'Check out our new filter options in the app!',
    type: 'system',
    timestamp: '3 days ago',
    read: true,
    icon: '🆕'
  },
  {
    id: '5',
    title: 'Payment Successful',
    message: 'Payment of ₹450 received for order #12343',
    type: 'order',
    timestamp: '4 days ago',
    read: true,
    icon: '💳'
  }
];

export default function NotificationsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleBack = () => {
    router.back();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={handleBack}>
            <span style={styles.backIcon}>←</span>
          </button>
          <h1 style={styles.headerTitle}>Notifications</h1>
        </div>
        <div style={styles.headerRight}>
          {unreadCount > 0 && (
            <button style={styles.actionButton} onClick={markAllAsRead}>
              Mark All Read
            </button>
          )}
          <button style={styles.actionButton} onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔔</div>
            <h2 style={styles.emptyTitle}>No notifications</h2>
            <p style={styles.emptyMessage}>
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  ...styles.notificationItem,
                  backgroundColor: notification.read ? '#ffffff' : '#f0f8ff'
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <div style={styles.notificationIcon}>
                  <span style={styles.icon}>{notification.icon}</span>
                </div>
                <div style={styles.notificationContent}>
                  <div style={styles.notificationHeader}>
                    <h3 style={styles.notificationTitle}>
                      {notification.title}
                    </h3>
                    <span style={styles.timestamp}>
                      {notification.timestamp}
                    </span>
                  </div>
                  <p style={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  <div style={styles.notificationFooter}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getTypeBadgeColor(notification.type)
                    }}>
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </span>
                    {!notification.read && (
                      <span style={styles.unreadDot}></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {notifications.length > 0 && (
        <div style={styles.summary}>
          <p style={styles.summaryText}>
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All notifications read'
            }
          </p>
        </div>
      )}
    </div>
  );
}

function getTypeBadgeColor(type: Notification['type']): string {
  switch (type) {
    case 'order': return '#4CAF50';
    case 'delivery': return '#2196F3';
    case 'offer': return '#FF9800';
    case 'system': return '#9C27B0';
    default: return '#666666';
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerRight: {
    display: 'flex',
    gap: '10px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    marginRight: '12px',
    borderRadius: '4px',
  },
  backIcon: {
    fontSize: '18px',
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
  },
  actionButton: {
    background: 'none',
    border: '1px solid #4CAF50',
    color: '#4CAF50',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '24px',
    color: '#333',
    margin: '0 0 8px 0',
  },
  emptyMessage: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  notificationItem: {
    display: 'flex',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  notificationIcon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: '4px',
  },
  icon: {
    fontSize: '24px',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  notificationTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
    flex: 1,
    marginRight: '12px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#666',
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: '14px',
    color: '#555',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  notificationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: '10px',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '500',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#FF5722',
    borderRadius: '50%',
  },
  summary: {
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e0e0e0',
  },
  summaryText: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
    textAlign: 'center' as const,
  },
};