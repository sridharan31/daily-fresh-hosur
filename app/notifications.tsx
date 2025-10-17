import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';

type NotificationType = 'order' | 'offer' | 'system' | 'delivery';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  icon: string;
}

const mockNotifications: NotificationItem[] = [
  { id: '1', title: 'Order Delivered', message: 'Your order #12345 has been delivered successfully!', type: 'delivery', timestamp: '2 hours ago', read: false, icon: '🚚' },
  { id: '2', title: 'Special Offer', message: '20% off on fresh fruits today only!', type: 'offer', timestamp: '1 day ago', read: false, icon: '🎉' },
  { id: '3', title: 'Order Confirmed', message: 'Your order #12344 has been confirmed and is being prepared.', type: 'order', timestamp: '2 days ago', read: true, icon: '✅' },
  { id: '4', title: 'New Features', message: 'Check out our new filter options in the app!', type: 'system', timestamp: '3 days ago', read: true, icon: '🔍' },
  { id: '5', title: 'Payment Successful', message: 'Payment of ₹450 received for order #12343', type: 'order', timestamp: '4 days ago', read: true, icon: '💳' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const handleBack = () => router.back();

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={nativeStyles.container}>
      <View style={nativeStyles.header}>
        <View style={nativeStyles.headerLeft}>
          <Pressable onPress={handleBack} style={nativeStyles.backButton}>
            <Text style={nativeStyles.backIcon}>←</Text>
          </Pressable>
          <Text style={nativeStyles.headerTitle}>Notifications</Text>
        </View>
        <View style={nativeStyles.headerRight}>
          {unreadCount > 0 && (
            <Pressable style={nativeStyles.actionButton} onPress={markAllAsRead}>
              <Text style={nativeStyles.actionButtonText}>Mark All Read</Text>
            </Pressable>
          )}
          <Pressable style={nativeStyles.actionButton} onPress={clearAll}>
            <Text style={nativeStyles.actionButtonText}>Clear All</Text>
          </Pressable>
        </View>
      </View>

      <View style={nativeStyles.content}>
        {notifications.length === 0 ? (
          <View style={nativeStyles.emptyState}>
            <Text style={nativeStyles.emptyIcon}>🔔</Text>
            <Text style={nativeStyles.emptyTitle}>No notifications</Text>
            <Text style={nativeStyles.emptyMessage}>You're all caught up! New notifications will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => markAsRead(item.id)}
                style={[nativeStyles.notificationItem, { backgroundColor: item.read ? '#fff' : '#f0f8ff' }]}
              >
                <View style={nativeStyles.notificationIcon}>
                  <Text style={nativeStyles.icon}>{item.icon}</Text>
                </View>
                <View style={nativeStyles.notificationContent}>
                  <View style={nativeStyles.notificationHeader}>
                    <Text style={nativeStyles.notificationTitle}>{item.title}</Text>
                    <Text style={nativeStyles.timestamp}>{item.timestamp}</Text>
                  </View>
                  <Text style={nativeStyles.notificationMessage}>{item.message}</Text>
                  <View style={nativeStyles.notificationFooter}>
                    <View style={[nativeStyles.badge, { backgroundColor: getTypeBadgeColor(item.type) }]}>
                      <Text style={nativeStyles.badgeText}>{capitalize(item.type)}</Text>
                    </View>
                    {!item.read && <View style={nativeStyles.unreadDot} />}
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      {notifications.length > 0 && (
        <View style={nativeStyles.summary}>
          <Text style={nativeStyles.summaryText}>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All notifications read'}</Text>
        </View>
      )}
    </View>
  );
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function getTypeBadgeColor(type: NotificationType) {
  switch (type) {
    case 'order': return '#4CAF50';
    case 'delivery': return '#2196F3';
    case 'offer': return '#FF9800';
    case 'system': return '#9C27B0';
    default: return '#666666';
  }
}

const nativeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', gap: 10 },
  backButton: { padding: 8, marginRight: 12 },
  backIcon: { fontSize: 18, color: '#4CAF50' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  actionButton: { borderWidth: 1, borderColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  actionButtonText: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.6 },
  emptyTitle: { fontSize: 22, color: '#333', marginBottom: 6 },
  emptyMessage: { fontSize: 16, color: '#666' },
  notificationItem: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'flex-start' },
  notificationIcon: { marginRight: 12, paddingTop: 4 },
  icon: { fontSize: 24 },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  notificationTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  timestamp: { fontSize: 12, color: '#666' },
  notificationMessage: { fontSize: 14, color: '#555', marginBottom: 12 },
  notificationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, backgroundColor: '#FF5722', borderRadius: 4 },
  summary: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  summaryText: { fontSize: 14, color: '#666', textAlign: 'center' },
});