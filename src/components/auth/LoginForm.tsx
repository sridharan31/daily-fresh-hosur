import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { z } from 'zod';

import { useAuthLogin, useAuthForgotPassword } from '../../hooks/useAuthFormsSupabase';

// Zod validation schema for login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token?: string;
}

interface LoginError {
  message: string;
  field?: string;
  code?: string;
}

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Use the enhanced auth hooks
  const loginMutation = useAuthLogin();
  const forgotPasswordMutation = useAuthForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    clearErrors();
    
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.success && result.user) {
          Alert.alert(
            'Welcome back!',
            `Hello ${result.user.firstName}, you've been logged in successfully.`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  // Navigate to main app or dashboard
                  console.log('Navigate to main app');
                },
              },
            ]
          );
        }
      },
      onError: (error: any) => {
        // Handle field-specific errors
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            if (err.field === 'email') {
              setError('email', { message: err.message });
            } else if (err.field === 'password') {
              setError('password', { message: err.message });
            }
          });
        }
        // Global error is automatically handled by the mutation error state
      },
    });
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address to receive a password reset link:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: (email) => {
            if (email && email.trim()) {
              forgotPasswordMutation.mutate(email.toLowerCase().trim(), {
                onSuccess: (result) => {
                  Alert.alert(
                    'Email Sent',
                    result.message || 'Password reset instructions have been sent to your email.',
                    [{ text: 'OK' }]
                  );
                },
                onError: (error: any) => {
                  Alert.alert(
                    'Error',
                    error.message || 'Failed to send reset email. Please try again.',
                    [{ text: 'OK' }]
                  );
                },
              });
            } else {
              Alert.alert('Error', 'Please enter a valid email address.', [{ text: 'OK' }]);
            }
          },
        },
      ],
      'plain-text',
      '',
      'email-address'
    );
  };

  const handleCreateAccount = () => {
    // Navigate to registration screen
    console.log('Navigate to registration');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#0ea5e9', '#3b82f6', '#6366f1']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.logoBackground}
              >
                <Icon name="shopping-bag" size={32} color="#3b82f6" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>
              Sign in to your grocery delivery account
            </Text>
          </View>
        </LinearGradient>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Global Error Message */}
            {loginMutation.error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorMessage}>{loginMutation.error.message}</Text>
                <TouchableOpacity
                  onPress={() => loginMutation.reset()}
                  style={styles.errorClose}
                >
                  <Icon name="x" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputContainer,
                    errors.email && styles.inputError,
                  ]}>
                    <Icon
                      name="mail"
                      size={20}
                      color={errors.email ? '#ef4444' : '#9ca3af'}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <View style={styles.fieldErrorContainer}>
                  <Icon name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
                </View>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputContainer,
                    errors.password && styles.inputError,
                  ]}>
                    <Icon
                      name="lock"
                      size={20}
                      color={errors.password ? '#ef4444' : '#9ca3af'}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <View style={styles.fieldErrorContainer}>
                  <Icon name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
                </View>
              )}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSubmit(handleLogin)}
              disabled={!isValid || loginMutation.isPending}
              style={[
                styles.loginButton,
                (!isValid || loginMutation.isPending) && styles.loginButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  !isValid || loginMutation.isPending
                    ? ['#9ca3af', '#6b7280']
                    : ['#3b82f6', '#2563eb']
                }
                style={styles.loginButtonGradient}
              >
                {loginMutation.isPending ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Icon name="log-in" size={20} color="white" />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handleCreateAccount}
              style={styles.createAccountButton}
              disabled={loginMutation.isPending}
            >
              <Icon name="user-plus" size={20} color="#3b82f6" />
              <Text style={styles.createAccountText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  form: {
    padding: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorMessage: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  errorClose: {
    padding: 4,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeButton: {
    padding: 4,
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  fieldErrorText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#dc2626',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  createAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  createAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default LoginForm;