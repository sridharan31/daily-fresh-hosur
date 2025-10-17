// App.tsx - Daily Fresh Hosur E-commerce App with Supabase
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Import global CSS for web platform
require('./global.css');

import { persistor, store } from './lib/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationUtils';

// Providers
import ReactQueryProvider from './lib/providers/ReactQueryProvider';

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

      // Simple initialization - the initializationService seems to be missing
      // For now, just set app as ready
      setIsAppReady(true);
      console.log('✅ App initialized successfully');
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
      <ReactQueryProvider>
        <GestureHandlerRootView>
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
    </ErrorBoundary>
  );
};

export default App;