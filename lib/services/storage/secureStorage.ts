// app/services/storage/secureStorage.ts
import { Platform } from 'react-native';

// This is a mock implementation since we don't have react-native-keychain installed
// In a real app, you would install and use react-native-keychain or similar
interface KeychainOptions {
  accessControl?: string;
  accessGroup?: string;
  authenticationType?: string;
  canImplyAuthentication?: boolean;
  showModal?: boolean;
  kLocalizedFallbackTitle?: string;
}

interface KeychainResult {
  username: string;
  password: string;
}

export interface SecureStorageService {
  setItem(key: string, value: string, options?: KeychainOptions): Promise<void>;
  getItem(key: string, options?: KeychainOptions): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  clear(): Promise<void>;
  hasItem(key: string): Promise<boolean>;
}

class SecureStorageServiceImpl implements SecureStorageService {
  private readonly SERVICE_NAME = 'GroceryDeliveryApp';

  // Mock implementation - replace with actual react-native-keychain
  private mockStorage: Map<string, string> = new Map();

  async setItem(key: string, value: string, options?: KeychainOptions): Promise<void> {
    try {
      // In real implementation, you would use:
      // await Keychain.setInternetCredentials(key, key, value, options);
      
      // Mock implementation
      this.mockStorage.set(key, value);
      console.log(`SecureStorage: Set item ${key} (mock implementation)`);
    } catch (error) {
      console.error(`Failed to set secure storage item ${key}:`, error);
      throw error;
    }
  }

  async getItem(key: string, options?: KeychainOptions): Promise<string | null> {
    try {
      // In real implementation, you would use:
      // const credentials = await Keychain.getInternetCredentials(key, options);
      // return credentials ? credentials.password : null;
      
      // Mock implementation
      const value = this.mockStorage.get(key);
      console.log(`SecureStorage: Get item ${key} (mock implementation)`);
      return value || null;
    } catch (error) {
      console.error(`Failed to get secure storage item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      // In real implementation, you would use:
      // await Keychain.resetInternetCredentials(key);
      
      // Mock implementation
      this.mockStorage.delete(key);
      console.log(`SecureStorage: Removed item ${key} (mock implementation)`);
    } catch (error) {
      console.error(`Failed to remove secure storage item ${key}:`, error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      // In real implementation, this would be more complex
      // as Keychain doesn't have a direct getAllKeys method
      
      // Mock implementation
      return Array.from(this.mockStorage.keys());
    } catch (error) {
      console.error('Failed to get all secure storage keys:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      // In real implementation, you would iterate through keys and remove each
      
      // Mock implementation
      this.mockStorage.clear();
      console.log('SecureStorage: Cleared all items (mock implementation)');
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      throw error;
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check secure storage item ${key}:`, error);
      return false;
    }
  }

  // Helper methods for common data types
  async setObject<T>(key: string, value: T, options?: KeychainOptions): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.setItem(key, jsonString, options);
    } catch (error) {
      console.error(`Failed to set secure storage object ${key}:`, error);
      throw error;
    }
  }

  async getObject<T>(key: string, options?: KeychainOptions): Promise<T | null> {
    try {
      const jsonString = await this.getItem(key, options);
      if (jsonString) {
        return JSON.parse(jsonString) as T;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get secure storage object ${key}:`, error);
      return null;
    }
  }

  async setNumber(key: string, value: number, options?: KeychainOptions): Promise<void> {
    await this.setItem(key, value.toString(), options);
  }

  async getNumber(key: string, defaultValue: number = 0, options?: KeychainOptions): Promise<number> {
    const value = await this.getItem(key, options);
    return value ? parseFloat(value) : defaultValue;
  }

  async setBoolean(key: string, value: boolean, options?: KeychainOptions): Promise<void> {
    await this.setItem(key, value.toString(), options);
  }

  async getBoolean(key: string, defaultValue: boolean = false, options?: KeychainOptions): Promise<boolean> {
    const value = await this.getItem(key, options);
    return value ? value === 'true' : defaultValue;
  }

  // Security-specific methods
  async setCredentials(key: string, username: string, password: string, options?: KeychainOptions): Promise<void> {
    try {
      const credentials = {
        username,
        password,
        timestamp: Date.now(),
      };
      await this.setObject(key, credentials, options);
    } catch (error) {
      console.error(`Failed to set credentials ${key}:`, error);
      throw error;
    }
  }

  async getCredentials(key: string, options?: KeychainOptions): Promise<{username: string; password: string} | null> {
    try {
      const credentials = await this.getObject<{username: string; password: string; timestamp: number}>(key, options);
      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to get credentials ${key}:`, error);
      return null;
    }
  }

  // Token management
  async setToken(key: string, token: string, expiresIn?: number, options?: KeychainOptions): Promise<void> {
    try {
      const tokenData = {
        token,
        expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined,
        createdAt: Date.now(),
      };
      await this.setObject(key, tokenData, options);
    } catch (error) {
      console.error(`Failed to set token ${key}:`, error);
      throw error;
    }
  }

  async getToken(key: string, options?: KeychainOptions): Promise<string | null> {
    try {
      const tokenData = await this.getObject<{
        token: string;
        expiresAt?: number;
        createdAt: number;
      }>(key, options);

      if (!tokenData) {
        return null;
      }

      // Check if token has expired
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        await this.removeItem(key);
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error(`Failed to get token ${key}:`, error);
      return null;
    }
  }

  async isTokenValid(key: string, options?: KeychainOptions): Promise<boolean> {
    const token = await this.getToken(key, options);
    return token !== null;
  }

  // Biometric authentication helpers
  async setItemWithBiometrics(key: string, value: string): Promise<void> {
    const options: KeychainOptions = {
      accessControl: 'BiometryAny',
      authenticationType: 'prompt',
      showModal: true,
      kLocalizedFallbackTitle: 'Please use your device passcode',
    };
    
    await this.setItem(key, value, options);
  }

  async getItemWithBiometrics(key: string): Promise<string | null> {
    const options: KeychainOptions = {
      accessControl: 'BiometryAny',
      authenticationType: 'prompt',
      showModal: true,
      kLocalizedFallbackTitle: 'Please use your device passcode',
    };
    
    return await this.getItem(key, options);
  }

  // Migration helpers
  async migrateFromVersion(fromVersion: string, toVersion: string): Promise<void> {
    try {
      console.log(`Migrating secure storage from ${fromVersion} to ${toVersion}`);
      
      // Add migration logic here based on version differences
      // For example, changing key formats, encryption methods, etc.
      
      // Store migration info
      await this.setObject('_migration_info', {
        fromVersion,
        toVersion,
        migratedAt: Date.now(),
      });
      
      console.log('Secure storage migration completed');
    } catch (error) {
      console.error('Failed to migrate secure storage:', error);
      throw error;
    }
  }

  // Backup and restore
  async createBackup(): Promise<{[key: string]: string}> {
    try {
      const keys = await this.getAllKeys();
      const backup: {[key: string]: string} = {};
      
      for (const key of keys) {
        if (!key.startsWith('_')) { // Skip internal keys
          const value = await this.getItem(key);
          if (value) {
            backup[key] = value;
          }
        }
      }
      
      return backup;
    } catch (error) {
      console.error('Failed to create secure storage backup:', error);
      throw error;
    }
  }

  async restoreFromBackup(backup: {[key: string]: string}): Promise<void> {
    try {
      // Clear existing data first
      await this.clear();
      
      // Restore from backup
      for (const [key, value] of Object.entries(backup)) {
        await this.setItem(key, value);
      }
      
      console.log('Secure storage restored from backup');
    } catch (error) {
      console.error('Failed to restore secure storage from backup:', error);
      throw error;
    }
  }

  // Get storage info
  async getStorageInfo(): Promise<{
    totalItems: number;
    keysWithBiometrics: number;
    lastAccessed?: number;
  }> {
    try {
      const keys = await this.getAllKeys();
      
      return {
        totalItems: keys.length,
        keysWithBiometrics: 0, // Would need to track this in real implementation
        lastAccessed: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get secure storage info:', error);
      return {
        totalItems: 0,
        keysWithBiometrics: 0,
      };
    }
  }
}

export const secureStorageService = new SecureStorageServiceImpl();
export default secureStorageService;

