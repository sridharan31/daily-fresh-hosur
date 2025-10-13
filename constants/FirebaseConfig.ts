// Firebase configuration using environment config
import Config from '../src/config/environment';

export const firebaseConfig = {
  apiKey: Config.FIREBASE_CONFIG.apiKey,
  authDomain: Config.FIREBASE_CONFIG.authDomain,
  projectId: Config.FIREBASE_CONFIG.projectId,
  storageBucket: Config.FIREBASE_CONFIG.storageBucket,
  messagingSenderId: Config.FIREBASE_CONFIG.messagingSenderId,
  appId: Config.FIREBASE_CONFIG.appId,
  measurementId: Config.FIREBASE_CONFIG.measurementId,
};

// For @react-native-firebase (native platforms)
export const RNFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  // Remove web-specific fields for native
  authDomain: undefined,
  measurementId: undefined,
};