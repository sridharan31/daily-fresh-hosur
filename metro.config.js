// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname, {
  // Enable CSS support for web
  isCSSEnabled: true,
});

// Configure NativeWind first, before other customizations
const configWithNativeWind = withNativeWind(config, { input: './global.css' });

// Add platform extensions
configWithNativeWind.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Watch folders
configWithNativeWind.watchFolders = [__dirname];

// Handle platform-specific modules for web
configWithNativeWind.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Web stub path
const webStubPath = path.resolve(__dirname, 'web-stubs');

// SINGLE MERGED resolveRequest function
configWithNativeWind.resolver.resolveRequest = (context, moduleName, platform) => {
  // Only apply custom resolution for web platform
  if (platform === 'web') {
    
    // Handle React Native AppRegistry specifically
    if (moduleName === 'react-native/Libraries/ReactNative/AppRegistry' || 
        moduleName.includes('AppRegistry')) {
      return {
        filePath: path.resolve(webStubPath, 'AppRegistry.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle Expo splash screen specifically
    if (moduleName === 'expo-splash-screen' || moduleName.includes('expo-splash-screen')) {
      return {
        filePath: path.resolve(webStubPath, 'expo-splash-screen.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle Expo internal modules that import from react-native
    if (moduleName.includes('expo/src/') || 
        moduleName === 'expo/src/Expo.fx.web' ||
        moduleName.includes('Expo.fx.web')) {
      return {
        filePath: path.resolve(webStubPath, 'expo.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle react-native-worklets and react-native-reanimated
    if (moduleName === 'react-native-worklets' || moduleName.includes('react-native-worklets')) {
      return {
        filePath: path.resolve(webStubPath, 'react-native-worklets.js'),
        type: 'sourceFile',
      };
    }
    
    if (moduleName === 'react-native-reanimated' || moduleName.includes('react-native-reanimated')) {
      return {
        filePath: path.resolve(webStubPath, 'react-native-reanimated.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle Expo modules that import from react-native
    if (moduleName.startsWith('expo/') || moduleName === 'expo') {
      return {
        filePath: path.resolve(webStubPath, 'expo.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle Stripe React Native
    if (moduleName === '@stripe/stripe-react-native') {
      return {
        filePath: path.resolve(webStubPath, 'stripe-react-native.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle codegenNativeComponent - catch all variations
    if (moduleName === 'react-native/Libraries/Utilities/codegenNativeComponent' ||
        moduleName.includes('codegenNativeComponent')) {
      return {
        filePath: path.resolve(webStubPath, 'codegenNativeComponent.js'),
        type: 'sourceFile',
      };
    }

    // Force react-native-svg resolution
    if (moduleName === 'react-native-svg') {
      return {
        filePath: path.resolve(webStubPath, 'react-native-svg.js'),
        type: 'sourceFile',
      };
    }
    
    // Force AsyncStorage resolution
    if (moduleName === '@react-native-async-storage/async-storage' || 
        moduleName.includes('@react-native-async-storage/async-storage') ||
        moduleName.includes('async-storage/lib/commonjs/AsyncStorage')) {
      return {
        filePath: path.resolve(webStubPath, 'async-storage.js'),
        type: 'sourceFile',
      };
    }
    
    // Force push notification stub
    if (moduleName === 'react-native-push-notification') {
      return {
        filePath: path.resolve(webStubPath, 'notifications.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle react-native-maps specifically
    if (moduleName.startsWith('react-native-maps')) {
      return {
        filePath: path.resolve(webStubPath, 'react-native-maps.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle codegenNativeCommands
    if (moduleName.includes('codegenNativeCommands')) {
      return {
        filePath: path.resolve(webStubPath, 'codegenNativeCommands.js'),
        type: 'sourceFile',
      };
    }
    
    // Block problematic React Native core modules
    if (moduleName.startsWith('react-native/Libraries/')) {
      const moduleMap = {
        'react-native/Libraries/BatchedBridge/NativeModules': path.resolve(webStubPath, 'NativeModules.js'),
        'react-native/Libraries/TurboModule/TurboModuleRegistry': path.resolve(webStubPath, 'TurboModuleRegistry.js'),
        'react-native/Libraries/Utilities/Platform': path.resolve(webStubPath, 'Platform.js'),
        'react-native/Libraries/BatchedBridge/BatchedBridge': path.resolve(webStubPath, 'BatchedBridge.js'),
        'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(webStubPath, 'codegenNativeCommands.js'),
        'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(webStubPath, 'codegenNativeComponent.js'),
      };
      
      if (moduleMap[moduleName]) {
        return {
          filePath: moduleMap[moduleName],
          type: 'sourceFile',
        };
      }
    }
    
    // Block feature flags
    if (moduleName.includes('NativeReactNativeFeatureFlags')) {
      return {
        filePath: path.resolve(webStubPath, 'NativeReactNativeFeatureFlags.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle @react-native-firebase/app native module
    if (moduleName === '@react-native-firebase/app/lib/internal/registry/nativeModule' ||
        moduleName.includes('@react-native-firebase/app/lib/internal/registry/nativeModule')) {
      return {
        filePath: path.resolve(webStubPath, '@react-native-firebase-app.js'),
        type: 'sourceFile',
      };
    }
    
    // Handle Platform module resolution - specific for TextInputState.js
    if (moduleName === '../../Utilities/Platform' || 
        moduleName.includes('Libraries/Utilities/Platform') ||
        moduleName.endsWith('Utilities/Platform')) {
      return {
        filePath: require.resolve('react-native-web/dist/exports/Platform'),
        type: 'sourceFile',
      };
    }
    
    // Handle other React Native web mappings
    if (moduleName === '../../ReactNative/RendererProxy') {
      return {
        filePath: require.resolve('react-native-web/dist/exports/findNodeHandle'),
        type: 'sourceFile',
      };
    }
  }
  
  // Use default resolver for other cases
  try {
    return context.resolveRequest(context, moduleName, platform);
  } catch (error) {
    // If default resolver fails, check our aliases
    const alias = config.resolver.alias[moduleName];
    if (alias) {
      return {
        filePath: alias,
        type: 'sourceFile',
      };
    }
    throw error;
  }
};

// Add resolver alias for web platform
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Expo core modules
  'expo$': path.resolve(webStubPath, 'expo.js'),
  'expo/src/Expo.fx.web': path.resolve(webStubPath, 'expo.js'),
  'expo-splash-screen': path.resolve(webStubPath, 'expo-splash-screen.js'),
  // React Native core modules for web
  'react-native/Libraries/ReactNative/AppRegistry': path.resolve(webStubPath, 'AppRegistry.js'),
  // Expo modules that might import from react-native
  'expo-modules-core': path.resolve(webStubPath, 'expo-modules.js'),
  '@expo/vector-icons': path.resolve(webStubPath, 'vector-icons.js'),
  // React Native Worklets and Reanimated
  'react-native-worklets': path.resolve(webStubPath, 'react-native-worklets.js'),
  'react-native-reanimated': path.resolve(webStubPath, 'react-native-reanimated.js'),
  // Stripe
  '@stripe/stripe-react-native': path.resolve(webStubPath, 'stripe-react-native.js'),
  // SVG
  'react-native-svg': path.resolve(webStubPath, 'react-native-svg.js'),
  // Native components
  'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(webStubPath, 'codegenNativeComponent.js'),
  // Force AsyncStorage to use our web stub with multiple patterns
  '@react-native-async-storage/async-storage$': path.resolve(webStubPath, 'async-storage.js'),
  '@react-native-async-storage/async-storage/lib/commonjs/AsyncStorage': path.resolve(webStubPath, 'async-storage.js'),
  // Alias native modules to our web stubs
  'react-native-maps$': path.resolve(webStubPath, 'react-native-maps.js'),
  'react-native-maps/': path.resolve(webStubPath, 'react-native-maps.js'),
  'react-native-maps/lib': path.resolve(webStubPath, 'react-native-maps.js'),
  'react-native-maps/src': path.resolve(webStubPath, 'react-native-maps.js'),
  'react-native-geolocation-service': path.resolve(webStubPath, 'geolocation.js'),
  'react-native-vector-icons/MaterialIcons': path.resolve(webStubPath, 'vector-icons.js'),
  'react-native-vector-icons': path.resolve(webStubPath, 'vector-icons.js'),
  '@react-native-firebase/analytics': path.resolve(webStubPath, 'firebase.js'),
  '@react-native-firebase/app': path.resolve(webStubPath, 'firebase.js'),
  '@react-native-firebase/crashlytics': path.resolve(webStubPath, 'firebase.js'),
  '@react-native-firebase/messaging': path.resolve(webStubPath, 'firebase.js'),
  'react-native-push-notification': path.resolve(webStubPath, 'notifications.js'),
  'react-native-fs': path.resolve(webStubPath, 'filesystem.js'),
  'react-native-document-picker': path.resolve(webStubPath, 'document-picker.js'),
  'react-native-image-picker': path.resolve(webStubPath, 'image-picker.js'),
  'react-native-permissions': path.resolve(webStubPath, 'permissions.js'),
  'react-native-gesture-handler': path.resolve(webStubPath, 'react-native-gesture-handler.js'),
  // Platform alias to prevent react-native imports
  'react-native/Libraries/Utilities/Platform$': path.resolve(webStubPath, 'Platform.js'),
  // Block the specific problematic import
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(webStubPath, 'codegenNativeCommands.js'),
  'react-native/Libraries/BatchedBridge/BatchedBridge': path.resolve(webStubPath, 'BatchedBridge.js'),
  'react-native/Libraries/BatchedBridge/NativeModules': path.resolve(webStubPath, 'NativeModules.js'),
  'react-native/Libraries/TurboModule/TurboModuleRegistry': path.resolve(webStubPath, 'TurboModuleRegistry.js'),
  'react-native/src/private/featureflags/specs/NativeReactNativeFeatureFlags': path.resolve(webStubPath, 'NativeReactNativeFeatureFlags.js'),
  // React Native core module stubs for web compatibility
  'react-native/Libraries/Utilities/Platform': path.resolve(webStubPath, 'react-native/Libraries/Utilities/Platform.js'),
  'react-native/Libraries/StyleSheet/PlatformColorValueTypes': path.resolve(webStubPath, 'react-native/Libraries/StyleSheet/PlatformColorValueTypes.js'),
  'react-native/Libraries/Components/View/BaseViewConfig': path.resolve(webStubPath, 'react-native/Libraries/Components/View/BaseViewConfig.js'),
  'react-native/Libraries/ReactNative/legacySendAccessibilityEvent': path.resolve(webStubPath, 'react-native/Libraries/ReactNative/legacySendAccessibilityEvent.js'),
  'react-native/Libraries/Core/ReactDevToolsSettingsManager': path.resolve(webStubPath, 'react-native/Libraries/Core/ReactDevToolsSettingsManager.js'),
  'react-native/Libraries/NativeModules/RCTAlertManager': path.resolve(webStubPath, 'react-native/Libraries/NativeModules/RCTAlertManager.js'),
  'react-native/Libraries/Network/RCTNetworking': path.resolve(webStubPath, 'react-native/Libraries/Network/RCTNetworking.js'),
  'react-native/Libraries/Utilities/BackHandler': path.resolve(webStubPath, 'react-native/Libraries/Utilities/BackHandler.js'),
  'react-native/Libraries/Image/Image': path.resolve(webStubPath, 'react-native/Libraries/Image/Image.js'),
};

// Add resolver block list for web
configWithNativeWind.resolver.blockList = [
  // Block react-native-maps from being imported on web
  /react-native-maps\/src\/.*\.ts$/,
  /react-native-maps\/lib\/.*\.js$/,
];

// Exclude native-only modules from web builds
configWithNativeWind.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Export the configured config
module.exports = configWithNativeWind;