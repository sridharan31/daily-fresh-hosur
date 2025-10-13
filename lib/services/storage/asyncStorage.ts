// app/services/storage/asyncStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AsyncStorageService {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiGet(keys: readonly string[]): Promise<readonly [string, string | null][]>;
  multiSet(keyValuePairs: readonly [string, string][]): Promise<void>;
  multiRemove(keys: readonly string[]): Promise<void>;
}

class AsyncStorageServiceImpl implements AsyncStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item ${key} from AsyncStorage:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item ${key} in AsyncStorage:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key} from AsyncStorage:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys from AsyncStorage:', error);
      return [];
    }
  }

  async multiGet(keys: readonly string[]): Promise<readonly [string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Failed to multi-get from AsyncStorage:', error);
      return [];
    }
  }

  async multiSet(keyValuePairs: readonly [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Failed to multi-set in AsyncStorage:', error);
      throw error;
    }
  }

  async multiRemove(keys: readonly string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to multi-remove from AsyncStorage:', error);
      throw error;
    }
  }

  // Helper methods for JSON storage
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.getItem(key);
      if (jsonString) {
        return JSON.parse(jsonString) as T;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get object ${key} from AsyncStorage:`, error);
      return null;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.setItem(key, jsonString);
    } catch (error) {
      console.error(`Failed to set object ${key} in AsyncStorage:`, error);
      throw error;
    }
  }

  // Helper methods for typed storage
  async getString(key: string, defaultValue: string = ''): Promise<string> {
    const value = await this.getItem(key);
    return value ?? defaultValue;
  }

  async getNumber(key: string, defaultValue: number = 0): Promise<number> {
    const value = await this.getItem(key);
    return value ? parseFloat(value) : defaultValue;
  }

  async getBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
    const value = await this.getItem(key);
    return value ? value === 'true' : defaultValue;
  }

  async setString(key: string, value: string): Promise<void> {
    await this.setItem(key, value);
  }

  async setNumber(key: string, value: number): Promise<void> {
    await this.setItem(key, value.toString());
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setItem(key, value.toString());
  }

  // Check if key exists
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  // Get storage size (approximate)
  async getStorageSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      const pairs = await this.multiGet(keys);
      
      let totalSize = 0;
      for (const [key, value] of pairs) {
        totalSize += key.length;
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  // Get all data for debugging
  async getAllData(): Promise<Record<string, string | null>> {
    try {
      const keys = await this.getAllKeys();
      const pairs = await this.multiGet(keys);
      
      const data: Record<string, string | null> = {};
      for (const [key, value] of pairs) {
        data[key] = value;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get all data from AsyncStorage:', error);
      return {};
    }
  }
}

export const asyncStorageService = new AsyncStorageServiceImpl();
export default asyncStorageService;

