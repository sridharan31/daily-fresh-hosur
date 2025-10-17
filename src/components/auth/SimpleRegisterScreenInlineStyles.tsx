import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
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

import { useAuthRegister } from '../../hooks/useAuthFormsSupabase';
import { DailyFreshLogo } from '../branding/DailyFreshLogo';

interface SimpleRegisterScreenProps {
  onRegisterSuccess?: () => void;
  onLoginPress?: () => void;
  showBackToLogin?: boolean;
  onBackPress?: () => void;
}

// ✅ This component uses INLINE STYLES to test if styling works on Android
export const SimpleRegisterScreenInlineStyles: React.FC<SimpleRegisterScreenProps> = ({
  onRegisterSuccess,
  onLoginPress,
  showBackToLogin = false,
  onBackPress,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const registerMutation = useAuthRegister();

  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return '';
  };

  const validateName = (name: string, fieldName: string): string => {
    if (!name) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Phone is required';
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
    return '';
  };

  const validateConfirmPassword = (confirm: string, pass: string): string => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== pass) return 'Passwords do not match';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};
    
    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) newErrors.firstName = firstNameError;
    
    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) newErrors.lastName = lastNameError;
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({ 
      firstName, 
      lastName, 
      email, 
      phone,
      password 
    }, {
      onSuccess: (result) => {
        if (result.success && result.user && onRegisterSuccess) {
          onRegisterSuccess();
        }
      },
      onError: (error: any) => {
        Alert.alert(
          'Registration Failed',
          error.message || 'Failed to create account. Please try again.'
        );
      },
    });
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <DailyFreshLogo width={120} height={48} variant="full" />
            </View>
            <Text style={styles.title}>Join Daily Fresh Hosur</Text>
            <Text style={styles.subtitle}>Your Local Fresh Grocery Partner</Text>
            <View style={styles.taglineContainer}>
              <View style={styles.greenDot} />
              <Text style={styles.tagline}>Fresh • Fast • Trusted</Text>
              <View style={styles.greenDot} />
            </View>
          </View>

          {/* Error Message */}
          {registerMutation.error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.errorText}>{registerMutation.error.message}</Text>
              <TouchableOpacity
                onPress={() => registerMutation.reset()}
                style={styles.errorCloseBtn}
              >
                <Icon name="x" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Name Row */}
            <View style={styles.nameRow}>
              {/* First Name Input */}
              <View style={styles.nameColumn}>
                <Text style={styles.label}>First Name</Text>
                <View style={[
                  styles.inputContainer,
                  { borderColor: errors.firstName ? '#fca5a5' : '#e5e7eb' }
                ]}>
                  <Icon name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName && <Text style={styles.fieldError}>{errors.firstName}</Text>}
              </View>

              {/* Last Name Input */}
              <View style={styles.nameColumn}>
                <Text style={styles.label}>Last Name</Text>
                <View style={[
                  styles.inputContainer,
                  { borderColor: errors.lastName ? '#fca5a5' : '#e5e7eb' }
                ]}>
                  <Icon name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.lastName && <Text style={styles.fieldError}>{errors.lastName}</Text>}
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.formField}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.email ? '#fca5a5' : '#e5e7eb' }
              ]}>
                <Icon name="mail" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.formField}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.phone ? '#fca5a5' : '#e5e7eb' }
              ]}>
                <Icon name="phone" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your phone"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.formField}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.password ? '#fca5a5' : '#e5e7eb' }
              ]}>
                <Icon name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.formField}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.confirmPassword ? '#fca5a5' : '#e5e7eb' }
              ]}>
                <Icon name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {registerMutation.isPending ? 'Creating Account...' : 'CREATE ACCOUNT'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={onLoginPress}>
                <Text style={styles.loginButton}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    marginHorizontal: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#15803d',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    color: '#991b1b',
    fontWeight: '500',
  },
  errorCloseBtn: {
    padding: 4,
  },
  formContainer: {
    gap: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nameColumn: {
    flex: 1,
  },
  formField: {
    marginBottom: 0,
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
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 0,
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginButton: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
});

export default SimpleRegisterScreenInlineStyles;
