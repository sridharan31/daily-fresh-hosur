/**
 * Web stub for Expo core modules
 * Handles internal Expo imports that might reference react-native
 */

// Mock requireOptionalNativeModule function
export const requireOptionalNativeModule = (moduleName) => {
  // Return null for all native modules on web
  return null;
};

// Mock requireNativeModule function
export const requireNativeModule = (moduleName) => {
  // Return a mock module for web
  return {
    [moduleName]: {},
  };
};

// Mock registerRootComponent function for web
export const registerRootComponent = (component) => {
  if (typeof window !== 'undefined') {
    // Web environment - register with React DOM
    try {
      const { AppRegistry } = require('react-native');
      AppRegistry.registerComponent('main', () => component);
      AppRegistry.runApplication('main', {
        rootTag: document.getElementById('root') || document.body
      });
    } catch {
      // Fallback for web
      console.log('registerRootComponent called on web with component:', component.name || 'Anonymous');
    }
  }
  return component;
};

// Mock Expo core functionality
export const Constants = {
  appOwnership: 'expo',
  debugMode: false,
  deviceName: 'Web Browser',
  deviceYearClass: 2023,
  experienceUrl: 'http://localhost:3003',
  expoRuntimeVersion: '2.28.0',
  expoVersion: '49.0.0',
  isDevice: false,
  platform: {
    ios: {
      buildNumber: '1',
      platform: 'ios',
    },
    android: {
      versionCode: 1,
    },
    web: {
      platform: 'web',
    },
  },
  statusBarHeight: 0,
  systemFonts: [],
  systemVersion: '1.0.0',
  sessionId: 'web-session',
  manifest: {},
  executionEnvironment: 'bare',
};

export const AppState = {
  currentState: 'active',
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

export const Linking = {
  openURL: (url) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    return Promise.resolve();
  },
  getInitialURL: () => Promise.resolve(null),
  canOpenURL: () => Promise.resolve(true),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

export const Notifications = {
  getPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  requestPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  getExpoPushTokenAsync: () => Promise.resolve({ data: 'web-push-token' }),
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  setNotificationHandler: () => {},
};

export const Updates = {
  checkForUpdateAsync: () => Promise.resolve({ isAvailable: false }),
  fetchUpdateAsync: () => Promise.resolve({ isNew: false }),
  reloadAsync: () => Promise.resolve(),
};

export const SplashScreen = {
  preventAutoHideAsync: () => Promise.resolve(),
  hideAsync: () => Promise.resolve(),
};

export const Font = {
  loadAsync: () => Promise.resolve(),
  isLoaded: () => true,
  isLoading: () => false,
};

export const Asset = {
  loadAsync: () => Promise.resolve([]),
  fromModule: () => ({ downloadAsync: () => Promise.resolve() }),
};

// Default export
export default {
  requireOptionalNativeModule,
  requireNativeModule,
  registerRootComponent,
  Constants,
  AppState,
  Linking,
  Notifications,
  Updates,
  SplashScreen,
  Font,
  Asset,
};