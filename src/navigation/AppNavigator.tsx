// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { RootStackParamList } from '../../lib/types/navigation';
import SplashScreen from '../../src/screens/SplashScreen';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const {isAuthenticated, user, isLoading} = useSelector((state: RootState) => state.auth);

  console.log('🧭 AppNavigator state:', { 
    isAuthenticated, 
    userRole: user?.role, 
    userEmail: user?.email,
    isLoading,
    user: user 
  });

  if (isLoading) {
    return <SplashScreen />;
  }

  // Debug: Let's see the exact condition evaluation
  console.log('🧭 Navigation decision:', {
    isAuthenticated,
    userRole: user?.role,
    isAdmin: user?.role === 'admin',
    willShowAdmin: isAuthenticated && user?.role === 'admin',
    willShowMain: isAuthenticated && user?.role !== 'admin',
    willShowAuth: !isAuthenticated
  });

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;