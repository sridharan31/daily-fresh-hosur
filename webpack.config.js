// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Create web stub for react-native-maps
  const webStubPath = path.resolve(__dirname, 'web-stubs');
  
  // Add resolve alias for native modules - SIMPLIFIED FOR DEBUGGING
  config.resolve.alias = {
    ...config.resolve.alias,
    // Core React Native - let react-native-web handle most components
    'react-native$': 'react-native-web',
    
    // Only block specific problematic modules
    'react-native-maps$': path.resolve(webStubPath, 'react-native-maps.js'),
    'react-native-chart-kit': path.resolve(webStubPath, 'react-native-chart-kit.js'),
    'react-native-vector-icons/MaterialIcons': path.resolve(webStubPath, 'vector-icons.js'),
    '@react-native-firebase/analytics': path.resolve(webStubPath, 'firebase.js'),
    '@react-native-firebase/app': path.resolve(webStubPath, 'firebase.js'),
    '@react-native-firebase/crashlytics': path.resolve(webStubPath, 'firebase.js'),
    '@react-native-firebase/messaging': path.resolve(webStubPath, 'firebase.js'),
    'react-native-push-notification': path.resolve(webStubPath, 'notifications.js'),
    'react-native-document-picker': path.resolve(webStubPath, 'document-picker.js'),
    'react-native-image-picker': path.resolve(webStubPath, 'image-picker.js'),
    'react-native-fs': path.resolve(webStubPath, 'filesystem.js'),
    'react-native-document-picker': path.resolve(webStubPath, 'document-picker.js'),
    'react-native-image-picker': path.resolve(webStubPath, 'image-picker.js'),
    'react-native-permissions': path.resolve(webStubPath, 'permissions.js'),
    '@react-native-async-storage/async-storage': path.resolve(webStubPath, 'async-storage.js'),
    'expo-notifications': path.resolve(webStubPath, 'notifications.js'),
    'expo-location': path.resolve(webStubPath, 'geolocation.js'),
  };

  // Handle platform specific files
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.jsx',
    '.web.js',
    ...config.resolve.extensions,
  ];

  // Exclude problematic modules from bundling - AGGRESSIVE BLOCKING
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native': 'react-native-web',
    'react-native/Libraries/Utilities/codegenNativeCommands': false,
    'react-native/Libraries/BatchedBridge': false,
    'react-native/Libraries/TurboModule': false,
    'react-native/Libraries/Core': false,
  };

  // Ensure CSS files are processed
  config.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader', 'postcss-loader'],
  });

  return config;
};
