import React from 'react';
import { StyleSheet, View } from '../../src/components/ui/WebCompatibleComponents';

// Import just the AdminTabNavigator to avoid drawer and stack navigators
import { AdminTabNavigator } from '../../src/navigation/AdminNavigator';

const AdminNavigationScreen = () => {
  return (
    <View style={styles.container}>
      {/* Embed just the tab navigator to avoid extra headers */}
      <AdminTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
});

export default AdminNavigationScreen;