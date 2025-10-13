// app/services/storage/storageService.ts
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

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Test storage functionality
      await this.set('test_init', 'test_value');
      const value = await this.get('test_init');
      await this.remove('test_init');
      
      if (value !== 'test_value') {
        throw new Error('Storage test failed');
      }
      
      console.log('Storage service initialized successfully');
    } catch (error) {
      console.error('Storage service initialization failed:', error);
      throw error;
    }
  }

  async set<T>(key: string, value: T, expirationMinutes?: number): Promise<void> {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiresAt: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : undefined,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const itemString = await AsyncStorage.getItem(key);
      if (!itemString) return null;

      const item: StorageItem<T> = JSON.parse(itemString);
      
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove storage item ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable array
    } catch (error) {
      console.error('Failed to get all storage keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: { [key: string]: any } = {};
      
      for (const [key, value] of pairs) {
        if (value) {
          try {
            const item: StorageItem = JSON.parse(value);
            
            // Check if item has expired
            if (item.expiresAt && Date.now() > item.expiresAt) {
              await this.remove(key);
              continue;
            }
            
            result[key] = item.data;
          } catch {
            // If parsing fails, treat as simple string value
            result[key] = value;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get multiple storage items:', error);
      return {};
    }
  }

  async multiSet(items: { [key: string]: any }): Promise<void> {
    try {
      const pairs: [string, string][] = Object.entries(items).map(([key, value]) => {
        const item: StorageItem = {
          data: value,
          timestamp: Date.now(),
        };
        return [key, JSON.stringify(item)];
      });
      
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Failed to set multiple storage items:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to remove multiple storage items:', error);
      throw error;
    }
  }

  // Cache with expiration helpers
  async setCache<T>(key: string, value: T, expirationMinutes: number = 60): Promise<void> {
    await this.set(key, value, expirationMinutes);
  }

  async getCache<T>(key: string): Promise<T | null> {
    return await this.get<T>(key);
  }

  // User preferences helpers
  async setUserPreference(key: string, value: any): Promise<void> {
    await this.set(`user_pref_${key}`, value);
  }

  async getUserPreference<T>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.get<T>(`user_pref_${key}`);
    return value !== null ? value : (defaultValue || null);
  }

  // App data helpers
  async setAppData(key: string, value: any): Promise<void> {
    await this.set(`app_data_${key}`, value);
  }

  async getAppData<T>(key: string): Promise<T | null> {
    return await this.get<T>(`app_data_${key}`);
  }

  // Cleanup expired items
  async cleanupExpiredItems(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const currentTime = Date.now();
      const expiredKeys: string[] = [];

      for (const key of keys) {
        try {
          const itemString = await AsyncStorage.getItem(key);
          if (itemString) {
            const item: StorageItem = JSON.parse(itemString);
            if (item.expiresAt && currentTime > item.expiresAt) {
              expiredKeys.push(key);
            }
          }
        } catch {
          // Skip items that can't be parsed
          continue;
        }
      }

      if (expiredKeys.length > 0) {
        await this.multiRemove(expiredKeys);
        console.log(`Cleaned up ${expiredKeys.length} expired storage items`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
    }
  }
}

export default StorageService;
