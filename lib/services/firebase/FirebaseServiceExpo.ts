// Expo-compatible Firebase service using Firebase JS SDK
import { Platform } from 'react-native';

// Firebase JS SDK (works with Expo Go and production builds)
let app: any = null;
let auth: any = null;
let analytics: any = null;

// Only initialize Firebase on web platform in development
// For native platforms, you'll need to add Firebase configuration
try {
  if (Platform.OS === 'web') {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    // Basic Firebase config - replace with your actual config
    const firebaseConfig = {
      apiKey: "demo-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    };
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Analytics only works in production builds, not Expo Go
    console.log('Firebase initialized for web platform');
  } else {
    console.log('Firebase native modules disabled - using mock implementations');
  }
} catch (error) {
  console.log('Firebase initialization failed:', error);
}

export class FirebaseService {
  static async logEvent(eventName: string, parameters?: { [key: string]: any }) {
    try {
      // Mock implementation for development
      console.log('Analytics Event (Mock):', eventName, parameters);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }

  static async setUserProperties(properties: { [key: string]: string }) {
    try {
      // Mock implementation for development
      console.log('User Properties (Mock):', properties);
    } catch (error) {
      console.log('User properties error:', error);
    }
  }

  static async logScreenView(screenName: string) {
    try {
      // Mock implementation for development
      console.log('Screen View (Mock):', screenName);
    } catch (error) {
      console.log('Screen view error:', error);
    }
  }

  static async recordError(error: Error, context?: string) {
    try {
      // Mock implementation for development
      console.log('Error Recording (Mock):', error.message, context);
    } catch (err) {
      console.log('Error recording failed:', err);
    }
  }

  static async log(message: string) {
    try {
      // Mock implementation for development
      console.log('Crashlytics Log (Mock):', message);
    } catch (error) {
      console.log('Logging error:', error);
    }
  }

  static async setUserId(userId: string) {
    try {
      // Mock implementation for development
      console.log('User ID Set (Mock):', userId);
    } catch (error) {
      console.log('Set user ID error:', error);
    }
  }

  static async setAttribute(key: string, value: string) {
    try {
      // Mock implementation for development
      console.log('Attribute Set (Mock):', key, value);
    } catch (error) {
      console.log('Set attribute error:', error);
    }
  }
}

export default FirebaseService;