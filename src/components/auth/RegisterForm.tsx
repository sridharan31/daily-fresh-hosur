import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
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

import { useAuthRegister } from '../../hooks/useAuthForms';

// Zod validation schema for registration
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .transform((email) => email.toLowerCase()),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(
        /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
        'Please enter a valid phone number'
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterResponse {
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

interface RegisterError {
  message: string;
  field?: string;
  code?: string;
}

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Use the enhanced auth hook
  const registerMutation = useAuthRegister();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '#e5e7eb' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: 'Very Weak', color: '#ef4444' },
      { text: 'Weak', color: '#f59e0b' },
      { text: 'Fair', color: '#eab308' },
      { text: 'Good', color: '#22c55e' },
      { text: 'Strong', color: '#10b981' },
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const handleRegister = async (data: RegisterFormData) => {
    clearErrors();
    
    // Remove confirmPassword and agreeToTerms from API payload
    const { confirmPassword, agreeToTerms, ...apiData } = data;

    registerMutation.mutate(apiData, {
      onSuccess: (result) => {
        if (result.success && result.user) {
          Alert.alert(
            'Welcome to Our Store!',
            `Hi ${result.user.firstName}, your account has been created successfully. You can now start shopping!`,
            [
              {
                text: 'Get Started',
                onPress: () => {
                  // Navigate to main app or login
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
            const field = err.field as keyof RegisterFormData;
            if (field && field in data) {
              setError(field, { message: err.message });
            }
          });
        }
        // Global error is automatically handled by the mutation error state
      },
    });
  };

  const handleLoginRedirect = () => {
    // Navigate to login screen
    console.log('Navigate to login');
  };

  const passwordStrength = getPasswordStrength(password);

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
          colors={['#10b981', '#059669', '#047857']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.logoBackground}
              >
                <Icon name="user-plus" size={32} color="#10b981" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Join us and start your grocery delivery journey
            </Text>
          </View>
        </LinearGradient>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Global Error Message */}
            {registerMutation.error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorMessage}>{registerMutation.error.message}</Text>
                <TouchableOpacity
                  onPress={() => registerMutation.reset()}
                  style={styles.errorClose}
                >
                  <Icon name="x" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* Name Fields Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>First Name</Text>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[
                      styles.inputContainer,
                      errors.firstName && styles.inputError,
                    ]}>
                      <Icon
                        name="user"
                        size={18}
                        color={errors.firstName ? '#ef4444' : '#9ca3af'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="First name"
                        placeholderTextColor="#9ca3af"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        autoComplete="given-name"
                        autoCorrect={false}
                      />
                    </View>
                  )}
                />
                {errors.firstName && (
                  <View style={styles.fieldErrorContainer}>
                    <Icon name="alert-circle" size={12} color="#ef4444" />
                    <Text style={styles.fieldErrorText}>{errors.firstName.message}</Text>
                  </View>
                )}
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>Last Name</Text>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[
                      styles.inputContainer,
                      errors.lastName && styles.inputError,
                    ]}>
                      <Icon
                        name="user"
                        size={18}
                        color={errors.lastName ? '#ef4444' : '#9ca3af'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Last name"
                        placeholderTextColor="#9ca3af"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        autoComplete="family-name"
                        autoCorrect={false}
                      />
                    </View>
                  )}
                />
                {errors.lastName && (
                  <View style={styles.fieldErrorContainer}>
                    <Icon name="alert-circle" size={12} color="#ef4444" />
                    <Text style={styles.fieldErrorText}>{errors.lastName.message}</Text>
                  </View>
                )}
              </View>
            </View>

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

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputContainer,
                    errors.phone && styles.inputError,
                  ]}>
                    <Icon
                      name="phone"
                      size={20}
                      color={errors.phone ? '#ef4444' : '#9ca3af'}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      autoCorrect={false}
                    />
                  </View>
                )}
              />
              {errors.phone && (
                <View style={styles.fieldErrorContainer}>
                  <Icon name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.fieldErrorText}>{errors.phone.message}</Text>
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
                      placeholder="Create a password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.emojiIcon}>
                        {showPassword ? '🙉' : '🙈'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              
              {/* Password Strength Indicator */}
              {password && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.passwordStrengthBar}>
                    <View
                      style={[
                        styles.passwordStrengthFill,
                        {
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}
              
              {errors.password && (
                <View style={styles.fieldErrorContainer}>
                  <Icon name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
                </View>
              )}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.inputContainer,
                    errors.confirmPassword && styles.inputError,
                  ]}>
                    <Icon
                      name="lock"
                      size={20}
                      color={errors.confirmPassword ? '#ef4444' : '#9ca3af'}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9ca3af"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.emojiIcon}>
                        {showConfirmPassword ? '🙉' : '🙈'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <View style={styles.fieldErrorContainer}>
                  <Icon name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.fieldErrorText}>{errors.confirmPassword.message}</Text>
                </View>
              )}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Controller
                control={control}
                name="agreeToTerms"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    onPress={() => onChange(!value)}
                    style={styles.checkboxContainer}
                  >
                    <View style={[
                      styles.checkbox,
                      value && styles.checkboxChecked,
                      errors.agreeToTerms && styles.checkboxError,
                    ]}>
                      {value && <Icon name="check" size={14} color="white" />}
                    </View>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              />
              {errors.agreeToTerms && (
                <View style={styles.fieldErrorContainer}>
                  <Icon name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.fieldErrorText}>{errors.agreeToTerms.message}</Text>
                </View>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleSubmit(handleRegister)}
              disabled={!isValid || registerMutation.isPending}
              style={[
                styles.registerButton,
                (!isValid || registerMutation.isPending) && styles.registerButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  !isValid || registerMutation.isPending
                    ? ['#9ca3af', '#6b7280']
                    : ['#10b981', '#059669']
                }
                style={styles.registerButtonGradient}
              >
                {registerMutation.isPending ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.registerButtonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Icon name="user-plus" size={20} color="white" />
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Redirect */}
            <View style={styles.loginRedirectContainer}>
              <Text style={styles.loginRedirectText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleLoginRedirect} disabled={registerMutation.isPending}>
                <Text style={styles.loginRedirectLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
    paddingVertical: 14,
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
  emojiIcon: {
    fontSize: 20,
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
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkboxError: {
    borderColor: '#ef4444',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#10b981',
    fontWeight: '500',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonGradient: {
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
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loginRedirectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginRedirectText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginRedirectLink: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
});

export default RegisterForm;