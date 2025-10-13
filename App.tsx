// App.tsx - Daily Fresh Hosur E-commerce App with Supabase
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Import global CSS for web
if (Platform.OS === 'web') {
  require('./global.css');
}

import { persistor, store } from './lib/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationUtils';

// Supabase Services

// Providers
import ReactQueryProvider from './lib/providers/ReactQueryProvider';
import NativeWindProvider from './src/components/common/NativeWindProvider';

// Components
import ErrorBoundary from './src/components/common/ErrorBoundary';
import LoadingScreen from './src/components/common/LoadingScreen';

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Starting app initialization...');

      const result = await initializationService.initialize();
      
      if (result.success) {
        if (result.warnings && result.warnings.length > 0) {
          console.warn('⚠️ App initialized with warnings:', result.warnings);
        }
        setIsAppReady(true);
        console.log('✅ App initialized successfully');
      } else {
        throw new Error(result.error || 'Unknown initialization error');
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize app:', error);
      setInitError(error.message || 'Failed to initialize app');
      
      // Show error alert and continue anyway
      Alert.alert(
        'Initialization Warning',
        'Some features may not work properly. Continue anyway?',
        [
          {
            text: 'Retry',
            onPress: () => {
              setInitError(null);
              initializeApp();
            },
          },
          {
            text: 'Continue',
            onPress: () => setIsAppReady(true),
          },
        ]
      );
    }
  };

  if (!isAppReady) {
    return (
      <LoadingScreen 
        message={initError ? 'Initialization failed' : 'Initializing app...'}
        backgroundColor={initError ? '#ffebee' : '#fff'}
      />
    );
  }

  return (
    <ErrorBoundary>
      <NativeWindProvider>
        <ReactQueryProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
              {persistor ? (
                <PersistGate loading={<LoadingScreen message="Restoring app state..." />} persistor={persistor}>
                  <NavigationContainer ref={navigationRef}>
                    <StatusBar
                      barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                      backgroundColor="#4CAF50"
                    />

                    <AppNavigator />
                  </NavigationContainer>
                </PersistGate>
              ) : (
                <NavigationContainer ref={navigationRef}>
                  <StatusBar
                    barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                    backgroundColor="#4CAF50"
                  />
                  <AppNavigator />
                </NavigationContainer>
                
              )}
            </Provider>
          </GestureHandlerRootView>
        </ReactQueryProvider>
      </NativeWindProvider>
    </ErrorBoundary>
  );
};

export default App;