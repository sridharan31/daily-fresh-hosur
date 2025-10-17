// Firebase service with conditional loading for different platforms
import { Platform } from 'react-native';

// Conditional Firebase imports to avoid loading on web or when not available
let analytics: any = null;
let crashlytics: any = null;

// Only load Firebase on native platforms
if (Platform.OS !== 'web') {
  try {
    analytics = require('@react-native-firebase/analytics').default;
    crashlytics = require('@react-native-firebase/crashlytics').default;
  } catch (error) {
    console.log('Firebase modules not available:', error);
  }
}

export class FirebaseService {
  static async logEvent(eventName: string, parameters?: { [key: string]: any }) {
    try {
      if (analytics && Platform.OS !== 'web') {
        await analytics().logEvent(eventName, parameters);
      }
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }

  static async setUserProperties(properties: { [key: string]: string }) {
    try {
      if (analytics && Platform.OS !== 'web') {
        await analytics().setUserProperties(properties);
      }
    } catch (error) {
      console.log('Analytics user properties error:', error);
    }
  }

  static async recordError(error: Error) {
    try {
      if (crashlytics && Platform.OS !== 'web') {
        await crashlytics().recordError(error);
      }
    } catch (err) {
      console.log('Crashlytics error:', err);
    }
  }

  static async setUserId(userId: string) {
    try {
      if (crashlytics && Platform.OS !== 'web') {
        await crashlytics().setUserId(userId);
      }
      if (analytics && Platform.OS !== 'web') {
        await analytics().setUserId(userId);
      }
    } catch (error) {
      console.log('Firebase setUserId error:', error);
    }
  }

  static async log(message: string) {
    try {
      if (crashlytics && Platform.OS !== 'web') {
        await crashlytics().log(message);
      }
    } catch (error) {
      console.log('Crashlytics log error:', error);
    }
  }
}

export default FirebaseService;