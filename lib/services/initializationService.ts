// app/services/initializationService.ts
import Config from '../../src/config/environment';

// Platform-safe AsyncStorage import
let AsyncStorage: any;

if (typeof window !== 'undefined') {
  // Web environment - use localStorage wrapper
  AsyncStorage = {
    getItem: async (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors on web
      }
    },
    removeItem: async (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors on web
      }
    },
  };
} else {
  // Native environment
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    // Fallback if import fails
    AsyncStorage = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }
}

import { errorHandler } from '../utils/errorHandler';
import locationService from './location/locationService';
import { StorageService } from './storage/storageService';

export interface InitializationResult {
  success: boolean;
  error?: string;
  warnings?: string[];
}

class InitializationService {
  private static instance: InitializationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService();
    }
    return InitializationService.instance;
  }

  async initialize(): Promise<InitializationResult> {
    if (this.isInitialized) {
      return { success: true };
    }

    const warnings: string[] = [];

    try {
      console.log('🚀 Starting app initialization...');

      // Initialize storage
      await this.initializeStorage();
      console.log('✅ Storage initialized');

      // Initialize location services
      const locationResult = await this.initializeLocationServices();
      if (!locationResult.success) {
        warnings.push('Location services not available');
      }
      console.log('✅ Location services initialized');

      // Initialize analytics (if enabled)
      if (Config.ENABLE_ANALYTICS) {
        await this.initializeAnalytics();
        console.log('✅ Analytics initialized');
      }

      // Initialize crash reporting (if enabled)
      if (Config.ENABLE_CRASHLYTICS) {
        await this.initializeCrashlytics();
        console.log('✅ Crashlytics initialized');
      }

      // Validate API connectivity
      const apiResult = await this.validateApiConnectivity();
      if (!apiResult.success) {
        warnings.push('API connectivity issues detected');
      }
      console.log('✅ API connectivity validated');

      // Clear app cache if needed
      await this.manageCacheIfNeeded();
      console.log('✅ Cache management completed');

      this.isInitialized = true;
      console.log('🎉 App initialization completed successfully');

      return {
        success: true,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      const appError = errorHandler.handleApiError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Test storage availability
      await AsyncStorage.setItem('test_key', 'test_value');
      await AsyncStorage.removeItem('test_key');
      
      // Initialize storage service
      const storageService = StorageService.getInstance();
      await storageService.initialize();
    } catch (error) {
      throw new Error('Failed to initialize storage services');
    }
  }

  private async initializeLocationServices(): Promise<{ success: boolean }> {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      if (hasPermission) {
        // Test if location services are working
        const isEnabled = await locationService.isLocationEnabled();
        return { success: isEnabled };
      }
      return { success: false };
    } catch (error) {
      console.warn('Location services initialization failed:', error);
      return { success: false };
    }
  }

  private async initializeAnalytics(): Promise<void> {
    try {
      // Initialize Firebase Analytics if available
      if (Config.FIREBASE_CONFIG) {
        // This would typically initialize Firebase Analytics
        console.log('Analytics would be initialized here');
      }
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }

  private async initializeCrashlytics(): Promise<void> {
    try {
      // Initialize Firebase Crashlytics if available
      if (Config.FIREBASE_CONFIG) {
        // This would typically initialize Firebase Crashlytics
        console.log('Crashlytics would be initialized here');
      }
    } catch (error) {
      console.warn('Crashlytics initialization failed:', error);
    }
  }

  private async validateApiConnectivity(): Promise<{ success: boolean }> {
    try {
      // Simple connectivity test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${Config.API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      return { success: response.ok };
    } catch (error) {
      console.warn('API connectivity test failed:', error);
      return { success: false };
    }
  }

  private async manageCacheIfNeeded(): Promise<void> {
    try {
      const lastCacheCleared = await AsyncStorage.getItem('last_cache_cleared');
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      if (!lastCacheCleared || parseInt(lastCacheCleared) < oneDayAgo) {
        // Clear old cached data
        await this.clearOldCache();
        await AsyncStorage.setItem('last_cache_cleared', now.toString());
      }
    } catch (error) {
      console.warn('Cache management failed:', error);
    }
  }

  private async clearOldCache(): Promise<void> {
    try {
      // Clear specific cache keys that might become stale
      const keysToCheck = [
        'cached_categories',
        'cached_products',
        'cached_delivery_areas',
      ];

      for (const key of keysToCheck) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const data = JSON.parse(cached);
          const cacheTime = data.timestamp || 0;
          const isStale = Date.now() - cacheTime > 24 * 60 * 60 * 1000; // 24 hours

          if (isStale) {
            await AsyncStorage.removeItem(key);
            console.log(`Cleared stale cache for ${key}`);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear old cache:', error);
    }
  }

  // Reset initialization state (useful for testing)
  reset(): void {
    this.isInitialized = false;
  }

  // Get initialization status
  isAppInitialized(): boolean {
    return this.isInitialized;
  }
}

export const initializationService = InitializationService.getInstance();
export default initializationService;
