import { Platform } from 'react-native';
import { firebaseConfig, RNFirebaseConfig } from '../constants/FirebaseConfig';

// Firebase services - lazy initialized
let firebaseApp: any = null;
let analytics: any = null;
let auth: any = null;
let firestore: any = null;
let messaging: any = null;
let crashlytics: any = null;
let initialized = false;

const initializeFirebase = () => {
  if (initialized) return;

  if (Platform.OS === 'web') {
    // Web platform - use Firebase JS SDK
    try {
      const { initializeApp } = require('firebase/app');
      firebaseApp = initializeApp(firebaseConfig);

      // Initialize services
      if (typeof window !== 'undefined') {
        const { getAnalytics } = require('firebase/analytics');
        analytics = getAnalytics(firebaseApp);
      }

      const { getAuth } = require('firebase/auth');
      const { getFirestore } = require('firebase/firestore');

      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);

      // Messaging requires service worker setup
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
        const { getMessaging } = require('firebase/messaging');
        messaging = getMessaging(firebaseApp);
      }

      initialized = true;
    } catch (error) {
      console.warn('Firebase web initialization failed:', error);
    }
  } else {
    // Native platforms - use @react-native-firebase
    try {
      const firebase = require('@react-native-firebase/app');
      firebaseApp = firebase.default;

      // Initialize with config if needed
      if (!firebaseApp.apps.length) {
        firebaseApp.initializeApp(RNFirebaseConfig);
      }

      // Initialize services
      analytics = require('@react-native-firebase/analytics').default;
      auth = require('@react-native-firebase/auth').default;
      firestore = require('@react-native-firebase/firestore').default;
      messaging = require('@react-native-firebase/messaging').default;
      crashlytics = require('@react-native-firebase/crashlytics').default;

      initialized = true;
    } catch (error) {
      console.warn('Firebase native initialization failed:', error);
    }
  }
};

// Lazy getters for Firebase services
export const getFirebaseApp = () => {
  initializeFirebase();
  return firebaseApp;
};

export const getAnalytics = () => {
  initializeFirebase();
  return analytics;
};

export const getAuth = () => {
  initializeFirebase();
  return auth;
};

export const getFirestore = () => {
  initializeFirebase();
  return firestore;
};

export const getMessaging = () => {
  initializeFirebase();
  return messaging;
};

export const getCrashlytics = () => {
  initializeFirebase();
  return crashlytics;
};

// For backward compatibility
export {
    analytics,
    auth, crashlytics, firebaseApp, firestore,
    messaging
};
