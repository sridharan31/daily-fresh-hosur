// Conditional permissions service for different platforms
import { Platform } from 'react-native';

// Conditional permissions imports to avoid loading when not available
let Permissions: any = null;
let PERMISSIONS: any = null;
let RESULTS: any = null;

// Only load permissions on native platforms where it's available
if (Platform.OS !== 'web') {
  try {
    const permissionsModule = require('react-native-permissions');
    Permissions = permissionsModule;
    PERMISSIONS = permissionsModule.PERMISSIONS;
    RESULTS = permissionsModule.RESULTS;
  } catch (error) {
    console.log('React Native Permissions module not available:', error);
  }
}

export class PermissionsService {
  static async requestLocationPermission(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return 'granted';
      }

      if (!Permissions || !PERMISSIONS || !RESULTS) {
        console.log('Permissions module not available, assuming granted');
        return 'granted';
      }

      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await Permissions.request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return 'granted';
        case RESULTS.DENIED:
          return 'denied';
        case RESULTS.BLOCKED:
          return 'blocked';
        case RESULTS.UNAVAILABLE:
          return 'unavailable';
        default:
          return 'denied';
      }
    } catch (error) {
      console.log('Permission request error:', error);
      return 'denied';
    }
  }

  static async checkLocationPermission(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return 'granted';
      }

      if (!Permissions || !PERMISSIONS || !RESULTS) {
        console.log('Permissions module not available, assuming granted');
        return 'granted';
      }

      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await Permissions.check(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return 'granted';
        case RESULTS.DENIED:
          return 'denied';
        case RESULTS.BLOCKED:
          return 'blocked';
        case RESULTS.UNAVAILABLE:
          return 'unavailable';
        default:
          return 'denied';
      }
    } catch (error) {
      console.log('Permission check error:', error);
      return 'denied';
    }
  }

  static async requestCameraPermission(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return 'granted';
      }

      if (!Permissions || !PERMISSIONS || !RESULTS) {
        console.log('Permissions module not available, assuming granted');
        return 'granted';
      }

      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.CAMERA;
      } else {
        permission = PERMISSIONS.ANDROID.CAMERA;
      }

      const result = await Permissions.request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return 'granted';
        case RESULTS.DENIED:
          return 'denied';
        case RESULTS.BLOCKED:
          return 'blocked';
        case RESULTS.UNAVAILABLE:
          return 'unavailable';
        default:
          return 'denied';
      }
    } catch (error) {
      console.log('Camera permission request error:', error);
      return 'denied';
    }
  }

  static async requestNotificationPermission(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return 'granted';
      }

      if (!Permissions || !PERMISSIONS || !RESULTS) {
        console.log('Permissions module not available, assuming granted');
        return 'granted';
      }

      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.NOTIFICATIONS;
      } else {
        // Android doesn't need runtime permission for notifications in most cases
        return 'granted';
      }

      const result = await Permissions.request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return 'granted';
        case RESULTS.DENIED:
          return 'denied';
        case RESULTS.BLOCKED:
          return 'blocked';
        case RESULTS.UNAVAILABLE:
          return 'unavailable';
        default:
          return 'denied';
      }
    } catch (error) {
      console.log('Notification permission request error:', error);
      return 'granted'; // Default to granted for Android
    }
  }
}

export default PermissionsService;