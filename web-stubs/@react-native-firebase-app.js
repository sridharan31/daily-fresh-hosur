/**
 * Web stub for @react-native-firebase/app native module
 * Provides RNFBAppModule for web compatibility
 */

// Mock native module for Firebase
const RNFBAppModule = {
  initializeApp: (config, name) => ({
    name: name || 'web-app',
    options: config,
  }),

  getApps: () => [{
    name: 'web-app',
    options: {},
  }],

  getApp: (name) => ({
    name: name || 'web-app',
    options: {},
  }),

  deleteApp: () => Promise.resolve(),

  getVersion: () => '18.0.0',

  getNativeModule: () => RNFBAppModule,

  addListener: () => ({ remove: () => {} }),
  removeListeners: () => {},
};

// Export for NativeModules
export default RNFBAppModule;