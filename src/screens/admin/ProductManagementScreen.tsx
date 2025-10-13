// src/screens/admin/ProductManagementScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ProductManagementScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.title}>Product Management</Text>
        <Text style={styles.message}>
          This feature is currently available only on mobile devices.
        </Text>
        <Text style={styles.submessage}>
          Please use the mobile app to access admin features like product management, 
          inventory control, and order processing.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
    lineHeight: 24,
  },
  submessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    lineHeight: 20,
  },
});

export default ProductManagementScreen;

// Default export to satisfy Expo Router (this file should not be treated as a route)
export function RouteNotFound() { return null; }