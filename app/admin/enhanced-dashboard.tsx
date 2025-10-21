import React from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';
import EnhancedAdminDashboardScreen from '../../src/screens/admin/EnhancedAdminDashboardScreen';

export default function EnhancedAdminDashboardPage() {
  return (
    <View style={styles.container}>
      <EnhancedAdminDashboardScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});