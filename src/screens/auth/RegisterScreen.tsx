import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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

import { validateConfirmPassword, validateEmail, validatePassword, validators } from '../../../lib/utils/validators';
import { DailyFreshLogo } from '../../components/branding/DailyFreshLogo';
import { useAuthRegister } from '../../hooks/useAuthFormsSupabase';

export const RegisterScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const registerMutation = useAuthRegister();

  const updateFormData = (field: keyof typeof errors, value: string): void => {
    if (field === 'firstName') setFirstName(value);
    else if (field === 'lastName') setLastName(value);
    else if (field === 'email') setEmail(value);
    else if (field === 'phone') setPhone(value);
    else if (field === 'password') setPassword(value);
    else if (field === 'confirmPassword') setConfirmPassword(value);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate first name
    const firstNameValidation = validators.validateName(firstName, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.errors[0] || 'Invalid first name';
      isValid = false;
    } else {
      newErrors.firstName = '';
    }

    // Validate last name
    const lastNameValidation = validators.validateName(lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.errors[0] || 'Invalid last name';
      isValid = false;
    } else {
      newErrors.lastName = '';
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validate phone
    const phoneValidation = validators.validatePhone(phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.errors[0] || 'Invalid phone number';
      isValid = false;
    } else {
      newErrors.phone = '';
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    } else {
      newErrors.password = '';
    }

    // Validate confirm password
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
      isValid = false;
    } else {
      newErrors.confirmPassword = '';
    }

    // Check terms agreement
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms and Conditions to continue.');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      firstName,
      lastName,
      email,
      phone,
      password,
    }, {
      onSuccess: (result) => {
        if (result.success && result.user) {
          // Navigation will be handled by auth state change
          router.replace('/(tabs)' as any);
        }
      },
      onError: (error: any) => {
        Alert.alert(
          'Registration Failed',
          error.message || 'An error occurred during registration. Please try again.'
        );
      },
    });
  };

  const handleLogin = () => {
    router.back();
  };

  const handleTermsPress = () => {
    Alert.alert('Terms and Conditions', 'Terms and Conditions will be displayed here.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy will be displayed here.');
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
      className="flex-1"
    >
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1 px-6 py-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header Section */}
          <View className="items-center mb-8">
            <View className="mb-6 bg-white rounded-full p-4 shadow-lg">
              <DailyFreshLogo width={120} height={48} variant="full" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
            <Text className="text-base text-gray-600 text-center leading-relaxed">
              Join us to start your grocery shopping journey
            </Text>
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
            <View className="flex-row gap-4">
              {/* First Name Input */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">First Name</Text>
                <View className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
                  errors.firstName ? 'border-red-400' : 'border-gray-200'
                }`}>
                  <Icon name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-base text-gray-800"
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
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
                    className="flex-1 text-base text-gray-800"
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
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
                  className="flex-1 text-base text-gray-800"
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(value) => updateFormData('email', value)}
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
                  className="flex-1 text-base text-gray-800"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={(value) => updateFormData('phone', value)}
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
                  className="flex-1 text-base text-gray-800"
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={(value) => updateFormData('password', value)}
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
                  className="flex-1 text-base text-gray-800"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
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

            {/* Terms Agreement */}
            <View className="my-4 py-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                className="flex-row items-start"
              >
                <View className={`w-5 h-5 border-2 rounded mt-1 items-center justify-center ${
                  agreedToTerms ? 'bg-green-600 border-green-600' : 'border-gray-300'
                }`}>
                  {agreedToTerms && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
                <Text className="flex-1 ml-3 text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <Text className="text-green-600 font-semibold" onPress={handleTermsPress}>
                    Terms and Conditions
                  </Text>
                  {' '}and{' '}
                  <Text className="text-green-600 font-semibold" onPress={handlePrivacyPress}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Default export to satisfy Expo Router (this file should be treated as a route)
export default RegisterScreen;

