// App.tsx - Daily Fresh Hosur E-commerce App with Supabase
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from './lib/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationUtils';

// Supabase Services
import authService from './lib/services/authService';
import localizationService from './lib/services/localizationService';

// Providers
import ReactQueryProvider from './lib/providers/ReactQueryProvider';
import NativeWindProvider from './src/components/common/NativeWindProvider';

// Components
import ErrorBoundary from './src/components/common/ErrorBoundary';
import LoadingScreen from './src/components/common/LoadingScreen';

// Prevent splash screen auto-hide
SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Starting Daily Fresh Hosur app initialization...');

      // Initialize localization service
      await localizationService.loadSavedLanguage();
      console.log('✅ Localization service initialized');

      // Check authentication state
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);
      console.log('✅ Authentication checked');

      // Set up auth state listener
      authService.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user || null);
      });

      setIsAppReady(true);
      console.log('✅ Daily Fresh Hosur app initialized successfully');

      // Hide splash screen
      await SplashScreen.hideAsync();

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      setIsAppReady(true); // Allow app to load with error state
      await SplashScreen.hideAsync();
    }
  };

  // Handle initialization error
  if (initError) {
    return (
      <ErrorBoundary>
        <LoadingScreen 
          message="Failed to initialize app. Please restart."
          error={initError}
        />
      </ErrorBoundary>
    );
  }

  // Show loading screen while app is initializing
  if (!isAppReady) {
    return (
      <LoadingScreen 
        message={localizationService.t('loading')}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen message="Loading..." />} persistor={persistor}>
          <ReactQueryProvider>
            <NativeWindProvider>
              <GestureHandlerRootView className="flex-1">
                <StatusBar style="auto" />
                <NavigationContainer ref={navigationRef}>
                  <AppNavigator initialUser={user} />
                </NavigationContainer>
              </GestureHandlerRootView>
            </NativeWindProvider>
          </ReactQueryProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;