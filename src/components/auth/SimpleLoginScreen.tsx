import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { router } from 'expo-router';

// Import the Supabase authentication hooks
import { useAuthLogin } from '../../hooks/useAuthFormsSupabase';
import { DailyFreshLogo } from '../branding/DailyFreshLogo';

interface SimpleLoginScreenProps {
  onLoginSuccess?: () => void;
  onRegisterPress?: () => void;
  onGuestPress?: () => void;
  showGuestOption?: boolean;
  showBackToOnboarding?: boolean;
  onBackPress?: () => void;
}

export const SimpleLoginScreen: React.FC<SimpleLoginScreenProps> = ({
  onLoginSuccess,
  onRegisterPress,
  onGuestPress,
  showGuestOption = false,
  showBackToOnboarding = false,
  onBackPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Use the Supabase authentication hooks instead of Redux
  const { mutate: login, isPending: isLoading, error: loginError, isSuccess, data: loginData } = useAuthLogin();

  // Handle successful authentication and navigation
  useEffect(() => {
    if (isSuccess && loginData?.user) {
      console.log('🎉 Login successful, user data:', loginData.user);
      console.log('🔍 User role detected:', loginData.user.role);
      
      // Role-based navigation using actual user role from database
      if (loginData.user.role === 'admin') {
        console.log('🔐 Admin user detected, redirecting to admin dashboard');
        router.replace('/admin');
      } else {
        console.log('👤 Regular user, redirecting to main app');
        router.replace('/(tabs)' as any);
      }
      
      // Call the onLoginSuccess callback if provided (but don't let it override navigation)
      if (onLoginSuccess) {
        console.log('📞 Calling onLoginSuccess callback');
        onLoginSuccess();
      }
    }
  }, [isSuccess, loginData, onLoginSuccess]);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(text) }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(text) }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Attempting login with:', { email });
      setLocalError(null);
      
      // Use the Supabase login mutation
      login({ email, password });
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const handleRegister = () => {
    if (onRegisterPress) {
      onRegisterPress();
    }
  };

  const handleGuestAccess = () => {
    if (onGuestPress) {
      onGuestPress();
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
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{ marginBottom: 24, backgroundColor: 'white', borderRadius: 50, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 }}>
              <DailyFreshLogo width={120} height={48} variant="full" />
            </View>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>Welcome Back!</Text>
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 8 }}>
              Fresh from Hosur Farms to your doorstep
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 6, marginRight: 8 }}></View>
              <Text style={{ fontSize: 14, color: '#16a34a', fontWeight: '500' }}>Fresh • Fast • Trusted</Text>
              <View style={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 6, marginLeft: 8 }}></View>
            </View>
          </View>

          {/* Error Message */}
          {loginError && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <Icon name="alert-circle" size={20} color="#dc2626" />
              <Text style={{ flex: 1, marginLeft: 12, color: '#dc2626', fontWeight: '500' }}>
                {loginError.message || 'Login failed. Please try again.'}
              </Text>
              <TouchableOpacity
                onPress={() => setLocalError(null)}
                style={{ padding: 4 }}
              >
                <Icon name="x" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Form Section */}
          <View style={{ marginBottom: 24 }}>
            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Email Address</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderWidth: 2,
                borderColor: errors.email ? '#f87171' : '#e5e7eb',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12
              }}>
                <Icon name="mail" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#1f2937',
                    outlineStyle: 'none'
                  }}
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
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Password</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderWidth: 2,
                borderColor: errors.password ? '#f87171' : '#e5e7eb',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12
              }}>
                <Icon name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#1f2937',
                    outlineStyle: 'none'
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 8 }}
                >
                  <Text style={{ fontSize: 20 }}>
                    {showPassword ? '🙈' : '🙉'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
              <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}>
                <Text style={{ color: '#16a34a', fontWeight: '500' }}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                opacity: isLoading ? 0.6 : 1,
                marginBottom: 20
              }}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#9ca3af'] : ['#22c55e', '#16a34a']}
                style={{ paddingVertical: 16, paddingHorizontal: 24 }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Guest Access */}
            {showGuestOption && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                  <Text style={{ marginHorizontal: 16, color: '#6b7280', fontWeight: '500' }}>OR</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                </View>

                <TouchableOpacity
                  onPress={handleGuestAccess}
                  disabled={isLoading}
                  style={{
                    borderWidth: 2,
                    borderColor: '#22c55e',
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    backgroundColor: 'white',
                    overflow: 'hidden'
                  }}
                >
                  <Text style={{ color: '#16a34a', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Continue as Guest</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
            <Text style={{ color: '#6b7280' }}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={{ color: '#16a34a', fontWeight: '600' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          {showBackToOnboarding && onBackPress && (
            <TouchableOpacity onPress={onBackPress} style={{ alignItems: 'center', paddingVertical: 16, marginTop: 16 }}>
              <Text style={{ color: '#16a34a', fontWeight: '500' }}>← Back to Onboarding</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SimpleLoginScreen;