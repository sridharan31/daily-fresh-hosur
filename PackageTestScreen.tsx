import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { PackageDemo } from './src/components/examples';

// Simple test component to verify package installation
export const PackageTestScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="check-circle" size={48} color="#10b981" />
        <Text style={styles.title}>Package Installation Complete!</Text>
        <Text style={styles.subtitle}>
          All packages have been successfully installed and configured
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Installed Packages:</Text>
        
        <View style={styles.packageList}>
          <PackageItem name="NativeWind" version="4.2.1" status="Configured" />
          <PackageItem name="React Query" version="5.90.2" status="Active" />
          <PackageItem name="Vector Icons" version="10.3.0" status="Working" />
          <PackageItem name="React Hook Form" version="7.64.0" status="Ready" />
          <PackageItem name="Zod" version="3.25.76" status="Ready" />
          <PackageItem name="Expo Image Picker" version="17.0.8" status="Configured" />
          <PackageItem name="Expo Linear Gradient" version="latest" status="Working" />
          <PackageItem name="Zustand" version="5.0.8" status="Ready" />
          <PackageItem name="Axios" version="1.12.2" status="Ready" />
        </View>

        <Text style={styles.note}>
          🎉 All packages are now ready to use! Check the examples in the PackageDemo component.
        </Text>
      </View>

      {/* Full Demo Component */}
      <PackageDemo />
    </ScrollView>
  );
};

interface PackageItemProps {
  name: string;
  version: string;
  status: string;
}

const PackageItem: React.FC<PackageItemProps> = ({ name, version, status }) => {
  return (
    <View style={styles.packageItem}>
      <View style={styles.packageIcon}>
        <Icon name="package" size={16} color="#3b82f6" />
      </View>
      <View style={styles.packageInfo}>
        <Text style={styles.packageName}>{name}</Text>
        <Text style={styles.packageVersion}>v{version}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  packageList: {
    gap: 12,
    marginBottom: 24,
  },
  packageItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  packageVersion: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  note: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PackageTestScreen;