import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Supabase services
import authService from '../../lib/services/authService';
import { supabase } from '../../lib/supabase';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const SupabaseSignupTestScreen: React.FC = () => {
  // Test data
  const [email, setEmail] = useState('test@dailyfresh.com');
  const [password, setPassword] = useState('Test123456!');
  const [fullName, setFullName] = useState('Test User');
  const [phone, setPhone] = useState('9876543210');
  
  // Test state
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.log('No current user:', error);
    }
  };

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateLastTestResult = (updates: Partial<TestResult>) => {
    setTestResults(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0) {
        updated[lastIndex] = { ...updated[lastIndex], ...updates };
      }
      return updated;
    });
  };

  const runSupabaseConnectionTest = async () => {
    addTestResult({
      step: 'Database Connection',
      status: 'pending',
      message: 'Testing Supabase connection...'
    });

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .limit(1);

      if (error) throw error;

      updateLastTestResult({
        status: 'success',
        message: `✅ Connected to Supabase successfully!`,
        details: { 
          url: process.env.SUPABASE_URL || 'Using fallback URL',
          tablesAccessible: true,
          settingsFound: data?.length || 0
        }
      });

      return true;
    } catch (error: any) {
      updateLastTestResult({
        status: 'error',
        message: `❌ Connection failed: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const runSignupTest = async () => {
    addTestResult({
      step: 'User Signup',
      status: 'pending',
      message: 'Testing user signup...'
    });

    try {
      // First, check if user already exists and clean up
      try {
        const existingUser = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (existingUser.data.user) {
          // User exists, sign them out first
          await authService.signOut();
          
          updateLastTestResult({
            status: 'success',
            message: `✅ Found existing test user, cleaned up session`,
            details: { existingUser: existingUser.data.user.email }
          });
          
          // Test login instead of signup
          return await runLoginTest();
        }
      } catch (error) {
        // User doesn't exist, proceed with signup
      }

      // Test signup
      const user = await authService.signUp({
        email,
        password,
        fullName,
        phone,
        preferredLanguage: 'ta' // Test Tamil preference
      });

      updateLastTestResult({
        status: 'success',
        message: `✅ Signup successful! User created: ${user.email}`,
        details: {
          userId: user.id,
          email: user.email,
          needsVerification: !user.email_confirmed_at,
          preferredLanguage: 'ta'
        }
      });

      setCurrentUser(user);
      return true;

    } catch (error: any) {
      updateLastTestResult({
        status: 'error',
        message: `❌ Signup failed: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const runLoginTest = async () => {
    addTestResult({
      step: 'User Login',
      status: 'pending',
      message: 'Testing user login...'
    });

    try {
      const user = await authService.signIn(email, password);

      updateLastTestResult({
        status: 'success',
        message: `✅ Login successful! Welcome: ${user.email}`,
        details: {
          userId: user.id,
          email: user.email,
          lastSignIn: user.last_sign_in_at
        }
      });

      setCurrentUser(user);
      return true;

    } catch (error: any) {
      updateLastTestResult({
        status: 'error',
        message: `❌ Login failed: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const runProfileTest = async () => {
    addTestResult({
      step: 'User Profile',
      status: 'pending',
      message: 'Testing user profile creation...'
    });

    try {
      // Get current user profile
      const profile = await authService.getUserProfile();

      if (profile) {
        updateLastTestResult({
          status: 'success',
          message: `✅ Profile found: ${profile.full_name}`,
          details: {
            fullName: profile.full_name,
            phone: profile.phone,
            preferredLanguage: profile.preferred_language,
            role: profile.role,
            isVerified: profile.is_verified
          }
        });
        return true;
      } else {
        throw new Error('No profile found');
      }

    } catch (error: any) {
      updateLastTestResult({
        status: 'error',
        message: `❌ Profile test failed: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const runAddressTest = async () => {
    addTestResult({
      step: 'Address Management',
      status: 'pending',
      message: 'Testing address management...'
    });

    try {
      // Add a test address
      const testAddress = {
        title: 'Test Address',
        address_line_1: '123 Test Street',
        city: 'Hosur',
        state: 'Tamil Nadu',
        pincode: '635109',
        landmark: 'Near Test Market'
      };

      const address = await authService.addUserAddress(testAddress);

      updateLastTestResult({
        status: 'success',
        message: `✅ Address added successfully!`,
        details: {
          addressId: address.id,
          title: address.title,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        }
      });

      return true;

    } catch (error: any) {
      updateLastTestResult({
        status: 'error',
        message: `❌ Address test failed: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const runCleanupTest = async () => {
    addTestResult({
      step: 'Cleanup',
      status: 'pending',
      message: 'Cleaning up test data...'
    });

    try {
      await authService.signOut();
      setCurrentUser(null);

      updateLastTestResult({
        status: 'success',
        message: `✅ Cleanup completed, user signed out`,
        details: { signedOut: true }
      });

      return true;

    } catch (error: any) {
      updateLastTestResult({
        status: 'error',
        message: `❌ Cleanup failed: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const runFullSignupTest = async () => {
    setIsTestRunning(true);
    setTestResults([]);

    try {
      // Test sequence
      const connectionOk = await runSupabaseConnectionTest();
      if (!connectionOk) return;

      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay

      const signupOk = await runSignupTest();
      if (!signupOk) return;

      await new Promise(resolve => setTimeout(resolve, 1000));

      const profileOk = await runProfileTest();
      if (profileOk) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await runAddressTest();
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await runCleanupTest();

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Supabase Signup Test</Text>
          <Text style={styles.subtitle}>Daily Fresh Hosur - Authentication Testing</Text>
        </View>

        {/* Current User Status */}
        <View style={styles.userStatus}>
          <Text style={styles.statusTitle}>Current User Status:</Text>
          <Text style={styles.statusText}>
            {currentUser ? `✅ Logged in: ${currentUser.email}` : '❌ Not logged in'}
          </Text>
        </View>

        {/* Test Data Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Data Configuration</Text>
          
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="test@dailyfresh.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />

          <Text style={styles.label}>Full Name:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
          />

          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={[styles.testButton, isTestRunning && styles.testButtonDisabled]}
          onPress={runFullSignupTest}
          disabled={isTestRunning}
        >
          {isTestRunning ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.testButtonText}>Run Complete Signup Test</Text>
          )}
        </TouchableOpacity>

        {/* Test Results */}
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          
          {testResults.map((result, index) => (
            <View key={index} style={styles.testResult}>
              <View style={styles.testHeader}>
                <Text style={styles.testIcon}>{getStatusIcon(result.status)}</Text>
                <Text style={styles.testStep}>{result.step}</Text>
              </View>
              
              <Text style={[styles.testMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
              
              {result.details && (
                <View style={styles.testDetails}>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Before Running Test:</Text>
          <Text style={styles.instructionText}>
            1. ✅ Deploy database schema using schema_safe.sql
          </Text>
          <Text style={styles.instructionText}>
            2. ✅ Verify Supabase project is accessible
          </Text>
          <Text style={styles.instructionText}>
            3. ✅ Check environment variables in .env
          </Text>
          <Text style={styles.instructionText}>
            4. ▶️ Click "Run Complete Signup Test"
          </Text>
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
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  userStatus: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  testButton: {
    backgroundColor: '#059669',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    margin: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  testResult: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  testStep: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  testMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  testDetails: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
  },
  instructions: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
});

export default SupabaseSignupTestScreen;