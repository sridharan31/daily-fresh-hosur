// Initialize React Native bridge for web BEFORE any other imports
// Import global CSS for web
if (typeof window !== 'undefined') {
  require('../global.css');
}

// Polyfill matchMedia for web compatibility
if (typeof window !== 'undefined') {
  require('../web-stubs/matchMedia');
}

if (typeof window !== 'undefined') {
  // Web platform compatibility fixes
  if (typeof global !== 'undefined') {
    const globalAny = global as any;
    
    // Initialize BatchedBridge configuration
    if (!globalAny.__fbBatchedBridgeConfig) {
      globalAny.__fbBatchedBridgeConfig = {
        remoteModuleConfig: [],
        localModulesConfig: [],
      };
    }
    
    // Mock BatchedBridge for web
    if (!globalAny.__fbBatchedBridge) {
      globalAny.__fbBatchedBridge = {
        registerCallableModule: () => {},
        registerLazyCallableModule: () => {},
        callFunctionReturnFlushedQueue: () => null,
        callFunctionReturnResultAndFlushedQueue: () => [null, null],
        flushedQueue: () => null,
        invokeCallbackAndReturnFlushedQueue: () => null,
        setGlobalHandler: () => {},
        enqueueNativeCall: () => {},
        createDebugLookup: () => ({}),
      };
    }
    
    // Mock other React Native globals for web
    if (!globalAny.__DEV__) {
      globalAny.__DEV__ = true;
    }
    
    if (!globalAny.HermesInternal) {
      globalAny.HermesInternal = null;
    }
    
    // Mock React Native's NativeModules
    if (!globalAny.nativeModuleProxy) {
      globalAny.nativeModuleProxy = {};
    }
  }
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NativeWindProvider from '../src/components/common/NativeWindProvider';
import { ThemeProvider } from '../src/contexts/ThemeContext';

// Store - Import from Supabase store
import { persistor, store } from '../lib/supabase/store';

// Create a client
const queryClient = new QueryClient();

// Web-safe GestureHandler component
const GestureHandlerRootView = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  if (typeof window !== 'undefined') {
    // Web environment - use React Native View instead of div
    return React.createElement(View, { style }, children);
  } else {
    // Native environment - use actual GestureHandlerRootView
    try {
      const { GestureHandlerRootView: NativeGestureHandlerRootView } = require('react-native-gesture-handler');
      return React.createElement(NativeGestureHandlerRootView, { style }, children);
    } catch {
      // Fallback to React Native View
      return React.createElement(View, { style }, children);
    }
  }
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NativeWindProvider>
              <ThemeProvider>
                {/* Initialize session on app startup */}
                {React.createElement(require('../src/components/auth/SessionInitializer').default)}
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="admin" 
                  options={{ 
                    headerShown: false,
                    title: 'Admin Dashboard'
                  }} 
                />
                <Stack.Screen 
                  name="notifications" 
                  options={{ 
                    headerShown: false,
                    title: 'Notifications'
                  }} 
                />
                <Stack.Screen 
                  name="checkout" 
                  options={{ 
                    headerShown: false,
                    title: 'Checkout'
                  }} 
                />
                <Stack.Screen 
                  name="order-confirmation" 
                  options={{ 
                    headerShown: false,
                    title: 'Order Confirmation'
                  }} 
                />
                <Stack.Screen 
                  name="(tabs)" 
                  options={{ 
                    headerShown: false,
                    title: 'Grocery App'
                  }} 
                />
                <Stack.Screen 
                  name="category/[id]" 
                  options={{ 
                    headerShown: false,
                    title: 'Category'
                  }} 
                />
                <Stack.Screen 
                  name="product/[id]" 
                  options={{ 
                    headerShown: false,
                    title: 'Product Details'
                  }} 
                />
                <Stack.Screen 
                  name="search/index" 
                  options={{ 
                    headerShown: false,
                    title: 'Search'
                  }} 
                />
              </Stack>
            </ThemeProvider>
          </NativeWindProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}