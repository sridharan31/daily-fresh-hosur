 // app/navigation/AuthNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';

// Auth Screens
import SimpleLoginScreen from '../../src/components/auth/SimpleLoginScreen';
import { ForgotPasswordScreen } from '../../src/screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../../src/screens/auth/OnboardingScreen';
import { OTPVerificationScreen } from '../../src/screens/auth/OTPVerificationScreen';
import PrivacyPolicyScreen from '../../src/screens/auth/PrivacyPolicyScreen';
import { RegisterScreen } from '../../src/screens/auth/RegisterScreen';
import ResetPasswordScreen from '../../src/screens/auth/ResetPasswordScreen';
import TermsAndConditionsScreen from '../../src/screens/auth/TermsAndConditionsScreen';
import WelcomeScreen from '../../src/screens/auth/WelcomeScreen';

// Types
export type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: {
    email?: string;
    fromScreen?: string;
  };
  AdminLogin: undefined;
  Register: {
    email?: string;
    referralCode?: string;
  };
  ForgotPassword: undefined;
  OTPVerification: {
    email: string;
    phone?: string;
    type: 'email' | 'phone' | 'registration' | 'password_reset';
    token: string;
  };
  ResetPassword: {
    token: string;
    email: string;
  };
  TermsAndConditions: {
    fromScreen?: string;
  };
  PrivacyPolicy: {
    fromScreen?: string;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const {otpVerificationRequired} = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        contentStyle: {backgroundColor: '#fff'},
      }}
      initialRouteName="Welcome"
    >
      {/* Welcome Screen */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />

      {/* Onboarding Flow */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          gestureEnabled: false,
          animation: 'slide_from_bottom',
        }}
      />

      {/* Authentication Screens */}
      <Stack.Screen
        name="Login"
        component={SimpleLoginScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AdminLogin"
        component={SimpleLoginScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Account',
          headerTintColor: '#4CAF50',
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: 'Reset Password',
          headerTintColor: '#4CAF50',
        }}
      />

      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={({route}) => ({
          headerShown: true,
          headerTitle: route.params.type === 'registration' ? 'Verify Account' : 'Enter Code',
          headerTintColor: '#4CAF50',
          gestureEnabled: !otpVerificationRequired, // Prevent back gesture during required verification
        })}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: 'New Password',
          headerTintColor: '#4CAF50',
          gestureEnabled: false, // Prevent going back after verification
        }}
      />

      {/* Legal Screens */}
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Terms & Conditions',
          headerTintColor: '#4CAF50',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Privacy Policy',
          headerTintColor: '#4CAF50',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

