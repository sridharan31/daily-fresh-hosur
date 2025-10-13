import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import the updated Supabase auth hooks
import { useAuthLogin, useAuthRegister } from '../hooks/useAuthFormsSupabase';

// Types for authentication results
interface AuthResult {
  user?: any;
  session?: any;
  profile?: any;
  message?: string;
}

interface AuthError {
  message: string;
}

const QuickAuthTestScreen: React.FC = () => {
  // Form states
  const [email, setEmail] = useState('test@dailyfresh.com');
  const [password, setPassword] = useState('Test123456!');
  const [firstName, setFirstName] = useState('Test');
  const [lastName, setLastName] = useState('User');
  const [phone, setPhone] = useState('9876543210');

  // Hook states
  const registerMutation = useAuthRegister();
  const loginMutation = useAuthLogin();

  // Test registration
  const handleTestRegister = () => {
    registerMutation.mutate({
      firstName,
      lastName,
      email,
      phone,
      password,
    }, {
      onSuccess: (result: AuthResult) => {
        Alert.alert(
          '✅ Registration Success!',
          `User created: ${result.user?.email}\n\n${result.message}`,
          [{ text: 'OK' }]
        );
      },
      onError: (error: AuthError) => {
        Alert.alert(
          '❌ Registration Failed',
          error.message || 'Unknown error occurred',
          [{ text: 'OK' }]
        );
      },
    });
  };

  // Test login
  const handleTestLogin = () => {
    loginMutation.mutate({
      email,
      password,
    }, {
      onSuccess: (result: AuthResult) => {
        Alert.alert(
          '✅ Login Success!',
          `Welcome: ${result.profile?.full_name || result.user?.email}\nEmail: ${result.user?.email}`,
          [{ text: 'OK' }]
        );
      },
      onError: (error: AuthError) => {
        Alert.alert(
          '❌ Login Failed',
          error.message || 'Unknown error occurred',
          [{ text: 'OK' }]
        );
      },
    });
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🔐 Quick Auth Test</Text>
          <Text style={styles.subtitle}>Test Supabase Authentication</Text>
        </View>

        {/* Status Display */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status:</Text>
          <Text style={styles.statusText}>
            ✅ Using Supabase Authentication Hooks
          </Text>
          <Text style={styles.statusText}>
            ✅ No more localhost:3000 API calls
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          <Text style={styles.label}>First Name:</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />

          <Text style={styles.label}>Last Name:</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />

          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={handleTestRegister}
            disabled={isLoading}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>🆕 Test Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleTestLogin}
            disabled={isLoading}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>🔓 Test Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {(registerMutation.error || loginMutation.error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Last Error:</Text>
            <Text style={styles.errorText}>
              {registerMutation.error?.message || loginMutation.error?.message}
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
          <Text style={styles.instructionText}>
            1. First deploy database schema (schema_safe.sql)
          </Text>
          <Text style={styles.instructionText}>
            2. Click "Test Register" to create new user
          </Text>
          <Text style={styles.instructionText}>
            3. Click "Test Login" to authenticate user
          </Text>
          <Text style={styles.instructionText}>
            4. Check console for detailed logs
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusContainer: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 4,
  },
  form: {
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
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#059669',
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f87171',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  instructions: {
    backgroundColor: '#fef3c7',
    padding: 16,
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

export default QuickAuthTestScreen;