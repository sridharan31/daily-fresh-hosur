// app/screens/admin/AdminSettingsScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';

interface SettingsState {
  notifications: {
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    customerMessages: boolean;
    systemUpdates: boolean;
  };
  business: {
    autoAcceptOrders: boolean;
    requireSignature: boolean;
    allowCashOnDelivery: boolean;
    enableLoyaltyProgram: boolean;
  };
  delivery: {
    sameDayDelivery: boolean;
    expressDelivery: boolean;
    deliveryTracking: boolean;
    contactlessDelivery: boolean;
  };
}

const AdminSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      orderNotifications: true,
      lowStockAlerts: true,
      customerMessages: true,
      systemUpdates: false,
    },
    business: {
      autoAcceptOrders: false,
      requireSignature: true,
      allowCashOnDelivery: true,
      enableLoyaltyProgram: true,
    },
    delivery: {
      sameDayDelivery: true,
      expressDelivery: false,
      deliveryTracking: true,
      contactlessDelivery: true,
    },
  });

  const handleToggle = (category: keyof SettingsState, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !(prev[category] as any)[setting],
      },
    }));
  };

  const handleSaveSettings = () => {
    // Implementation for saving settings
    Alert.alert('Success', 'Settings saved successfully');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to default settings
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    category: keyof SettingsState,
    setting: string,
    title: string,
    description: string
  ) => (
    <View style={styles.settingItem} key={`${category}-${setting}`}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={(settings[category] as any)[setting]}
        onValueChange={() => handleToggle(category, setting)}
        trackColor={{ false: '#767577', true: '#4CAF50' }}
        thumbColor={(settings[category] as any)[setting] ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Admin Settings" showBack />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📱 Notification Settings</Text>
          
          {renderSettingItem(
            'notifications',
            'orderNotifications',
            'Order Notifications',
            'Get notified when new orders are placed'
          )}
          
          {renderSettingItem(
            'notifications',
            'lowStockAlerts',
            'Low Stock Alerts',
            'Receive alerts when products are running low'
          )}
          
          {renderSettingItem(
            'notifications',
            'customerMessages',
            'Customer Messages',
            'Get notified of customer support messages'
          )}
          
          {renderSettingItem(
            'notifications',
            'systemUpdates',
            'System Updates',
            'Receive notifications about system updates'
          )}
        </Card>

        {/* Business Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏪 Business Settings</Text>
          
          {renderSettingItem(
            'business',
            'autoAcceptOrders',
            'Auto Accept Orders',
            'Automatically accept orders without manual review'
          )}
          
          {renderSettingItem(
            'business',
            'requireSignature',
            'Require Signature',
            'Require customer signature for delivery confirmation'
          )}
          
          {renderSettingItem(
            'business',
            'allowCashOnDelivery',
            'Cash on Delivery',
            'Allow customers to pay cash on delivery'
          )}
          
          {renderSettingItem(
            'business',
            'enableLoyaltyProgram',
            'Loyalty Program',
            'Enable customer loyalty points and rewards'
          )}
        </Card>

        {/* Delivery Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🚚 Delivery Settings</Text>
          
          {renderSettingItem(
            'delivery',
            'sameDayDelivery',
            'Same Day Delivery',
            'Offer same day delivery service'
          )}
          
          {renderSettingItem(
            'delivery',
            'expressDelivery',
            'Express Delivery',
            'Offer express delivery (1-2 hours)'
          )}
          
          {renderSettingItem(
            'delivery',
            'deliveryTracking',
            'Delivery Tracking',
            'Enable real-time delivery tracking'
          )}
          
          {renderSettingItem(
            'delivery',
            'contactlessDelivery',
            'Contactless Delivery',
            'Offer contactless delivery option'
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
            style={styles.saveButton}
          />
          
          <Button
            title="Reset to Default"
            onPress={handleResetSettings}
            style={styles.resetButton}
            textStyle={styles.resetButtonText}
            variant="outline"
          />
        </View>

        {/* Additional Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚙️ Advanced Settings</Text>
          
          <Button
            title="Database Backup"
            onPress={() => Alert.alert('Info', 'Database backup feature')}
            style={styles.advancedButton}
            textStyle={styles.advancedButtonText}
            variant="outline"
          />
          
          <Button
            title="Export Data"
            onPress={() => Alert.alert('Info', 'Data export feature')}
            style={styles.advancedButton}
            textStyle={styles.advancedButtonText}
            variant="outline"
          />
          
          <Button
            title="System Logs"
            onPress={() => Alert.alert('Info', 'System logs feature')}
            style={styles.advancedButton}
            textStyle={styles.advancedButtonText}
            variant="outline"
          />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  resetButton: {
    borderColor: '#FF5722',
    paddingVertical: 14,
  },
  resetButtonText: {
    color: '#FF5722',
  },
  advancedButton: {
    backgroundColor: 'transparent',
    borderColor: '#e0e0e0',
    marginBottom: 12,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
  advancedButtonText: {
    color: '#333',
    textAlign: 'left',
  },
});

export default AdminSettingsScreen;
