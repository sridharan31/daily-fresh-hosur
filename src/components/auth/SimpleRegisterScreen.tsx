import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useAuthRegister } from '../../hooks/useAuthForms';
import { DailyFreshLogo } from '../branding/DailyFreshLogo';

interface SimpleRegisterScreenProps {
  onRegisterSuccess?: () => void;
  onLoginPress?: () => void;
  showBackToLogin?: boolean;
  onBackPress?: () => void;
}

export const SimpleRegisterScreen: React.FC<SimpleRegisterScreenProps> = ({
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

  // Validation functions
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

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid phone number';
    return '';
  };

  const validateName = (name: string, fieldName: string): string => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
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

  // Input change handlers with real-time validation
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: validateName(value, 'First name') || undefined }));
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: validateName(value, 'Last name') || undefined }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) || undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: validatePhone(value) || undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) || undefined }));
    }
    // Also validate confirm password if it exists
    if (confirmPassword && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, value) || undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) || undefined }));
    }
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

  const handleLogin = () => {
    if (onLoginPress) {
      onLoginPress();
    }
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
          <View className="items-center mb-8">
            <View className="mb-6 bg-white rounded-full p-4 shadow-lg">
              <DailyFreshLogo width={120} height={48} variant="full" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-2">Join Daily Fresh Hosur</Text>
            <Text className="text-base text-gray-600 text-center leading-relaxed mb-2">
              Your Local Fresh Grocery Partner
            </Text>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2"></View>
              <Text className="text-sm text-green-600 font-medium">Fresh • Fast • Trusted</Text>
              <View className="w-3 h-3 bg-green-500 rounded-full ml-2"></View>
            </View>
          </View>

          {/* Error Message */}
          {registerMutation.error && (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <Icon name="alert-circle" size={20} color="#dc2626" />
              <Text className="flex-1 ml-3 text-red-700 font-medium">{registerMutation.error.message}</Text>
              <TouchableOpacity
                onPress={() => registerMutation.reset()}
                className="p-1"
              >
                <Icon name="x" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Form Section */}
          <View className="space-y-6">
            {/* Name Row */}
            <View className="flex-row space-x-4">
              {/* First Name Input */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">First Name</Text>
                <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                  errors.firstName ? 'border-red-400' : 'border-gray-200'
                }`}>
                  <Icon name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-base text-gray-800 outline-none"
                    style={{ outlineStyle: 'none' }}
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={handleFirstNameChange}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    autoCorrect={false}
                  />
                </View>
                {errors.firstName && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">{errors.firstName}</Text>
                )}
              </View>

              {/* Last Name Input */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Last Name</Text>
                <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                  errors.lastName ? 'border-red-400' : 'border-gray-200'
                }`}>
                  <Icon name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-base text-gray-800 outline-none"
                    style={{ outlineStyle: 'none' }}
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={handleLastNameChange}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    autoCorrect={false}
                  />
                </View>
                {errors.lastName && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
              <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                errors.email ? 'border-red-400' : 'border-gray-200'
              }`}>
                <Icon name="mail" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base text-gray-800 outline-none"
                  style={{ outlineStyle: 'none' }}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
              <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                errors.phone ? 'border-red-400' : 'border-gray-200'
              }`}>
                <Icon name="phone" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base text-gray-800 outline-none"
                  style={{ outlineStyle: 'none' }}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  autoCorrect={false}
                />
              </View>
              {errors.phone && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.phone}</Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
              <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                errors.password ? 'border-red-400' : 'border-gray-200'
              }`}>
                <Icon name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base text-gray-800 outline-none"
                  style={{ outlineStyle: 'none' }}
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Text className="text-2xl">
                    {showPassword ? '🙈' : '🙉'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Confirm Password</Text>
              <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
              }`}>
                <Icon name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base text-gray-800 outline-none"
                  style={{ outlineStyle: 'none' }}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                >
                  <Text className="text-2xl">
                    {showConfirmPassword ? '🙈' : '🙉'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={registerMutation.isPending}
              className="rounded-xl overflow-hidden mt-6"
              style={{
                opacity: registerMutation.isPending ? 0.6 : 1
              }}
            >
              <LinearGradient
                colors={registerMutation.isPending ? ['#9ca3af', '#9ca3af'] : ['#22c55e', '#16a34a']}
                className="py-4 px-6"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text className="text-green-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          {showBackToLogin && onBackPress && (
            <TouchableOpacity onPress={onBackPress} className="items-center py-4 mt-4">
              <Text className="text-green-600 font-medium">← Back to Login</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SimpleRegisterScreen;