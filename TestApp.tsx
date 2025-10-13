import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import test screens
import ServiceTestScreen from './src/screens/ServiceTestScreen';
import SupabaseSignupTestScreen from './src/screens/SupabaseSignupTestScreen';

const TestApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = React.useState<'menu' | 'signup' | 'services'>('menu');

  if (currentScreen === 'signup') {
    return <SupabaseSignupTestScreen />;
  }

  if (currentScreen === 'services') {
    return <ServiceTestScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Daily Fresh Test Suite</Text>
          <Text style={styles.subtitle}>Supabase Backend Testing</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tests</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => setCurrentScreen('signup')}
          >
            <Text style={styles.testButtonText}>🔐 Supabase Signup Test</Text>
            <Text style={styles.testDescription}>
              Test user registration, authentication, and profile creation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => setCurrentScreen('services')}
          >
            <Text style={styles.testButtonText}>🛠️ Services Integration Test</Text>
            <Text style={styles.testDescription}>
              Test all backend services (products, cart, orders, payments)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Before Testing:</Text>
          <Text style={styles.instructionText}>
            ✅ 1. Deploy database schema using schema_safe.sql
          </Text>
          <Text style={styles.instructionText}>
            ✅ 2. Verify Supabase project is accessible
          </Text>
          <Text style={styles.instructionText}>
            ✅ 3. Check .env file has correct credentials
          </Text>
          
          <View style={styles.quickLinks}>
            <Text style={styles.quickLinksTitle}>🔗 Quick Links:</Text>
            <Text style={styles.linkText}>
              • Supabase SQL Editor: https://supabase.com/dashboard/project/yvjxgoxrzkcjvuptblri/sql
            </Text>
            <Text style={styles.linkText}>
              • Schema file: database/schema_safe.sql
            </Text>
          </View>
        </View>

        <View style={styles.status}>
          <Text style={styles.statusTitle}>🚀 Deployment Status</Text>
          <Text style={styles.statusItem}>✅ Supabase Client: Configured</Text>
          <Text style={styles.statusItem}>✅ Environment: Variables set</Text>
          <Text style={styles.statusItem}>✅ Services: 6 services ready</Text>
          <Text style={styles.statusItem}>⏳ Database: Deploy schema_safe.sql</Text>
          <Text style={styles.statusItem}>⏳ Testing: Run tests below</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  testDescription: {
    color: '#d1fae5',
    fontSize: 14,
  },
  instructions: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
  },
  quickLinks: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fcd34d',
  },
  quickLinksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  status: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  statusItem: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 6,
  },
});

export default TestApp;