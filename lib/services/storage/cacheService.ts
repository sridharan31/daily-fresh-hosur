// app/services/storage/cacheService.ts
import { asyncStorageService } from './asyncStorage';

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version?: string;
}

export interface CacheConfig {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  version?: string; // Cache version for invalidation
}

class CacheService {
  private static instance: CacheService;
  private config: CacheConfig;
  private memoryCache: Map<string, CacheItem> = new Map();
  private readonly CACHE_PREFIX = 'cache_';
  private readonly CACHE_INDEX_KEY = 'cache_index';

  private constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: 60 * 60 * 1000, // 1 hour default
      maxSize: 100,
      version: '1.0.0',
      ...config,
    };
  }

  static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  // Generate cache key with prefix
  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  // Set item in cache with optional TTL
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expirationTime = ttl || this.config.defaultTTL;
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiresAt: expirationTime ? Date.now() + expirationTime : undefined,
        version: this.config.version,
      };

      const cacheKey = this.getCacheKey(key);

      // Store in memory cache
      this.memoryCache.set(key, cacheItem);

      // Store in persistent storage
      await asyncStorageService.setObject(cacheKey, cacheItem);

      // Update cache index
      await this.updateCacheIndex(key);

      // Clean up if cache is too large
      await this.cleanupIfNeeded();
    } catch (error) {
      console.error(`Failed to set cache item ${key}:`, error);
      throw error;
    }
  }

  // Get item from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      let cacheItem = this.memoryCache.get(key);

      // If not in memory, check persistent storage
      if (!cacheItem) {
        const cacheKey = this.getCacheKey(key);
        const persistedItem = await asyncStorageService.getObject<CacheItem<T>>(cacheKey);
        
        if (persistedItem) {
          cacheItem = persistedItem;
          // Add back to memory cache
          this.memoryCache.set(key, cacheItem);
        }
      }

      if (!cacheItem) {
        return null;
      }

      // Check if item has expired
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      // Check if version matches
      if (cacheItem.version && cacheItem.version !== this.config.version) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error(`Failed to get cache item ${key}:`, error);
      return null;
    }
  }

  // Remove item from cache
  async remove(key: string): Promise<void> {
    try {
      // Remove from memory cache
      this.memoryCache.delete(key);

      // Remove from persistent storage
      const cacheKey = this.getCacheKey(key);
      await asyncStorageService.removeItem(cacheKey);

      // Update cache index
      await this.removeCacheIndex(key);
    } catch (error) {
      console.error(`Failed to remove cache item ${key}:`, error);
      throw error;
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Get all cache keys and remove them
      const index = await this.getCacheIndex();
      const removePromises = index.map(key => {
        const cacheKey = this.getCacheKey(key);
        return asyncStorageService.removeItem(cacheKey);
      });

      await Promise.all(removePromises);

      // Clear cache index
      await asyncStorageService.removeItem(this.CACHE_INDEX_KEY);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  // Check if key exists in cache and is not expired
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  // Get cache statistics
  async getStats(): Promise<{
    memorySize: number;
    persistentSize: number;
    totalItems: number;
    expiredItems: number;
  }> {
    try {
      const index = await this.getCacheIndex();
      let expiredItems = 0;

      for (const key of index) {
        const cacheKey = this.getCacheKey(key);
        const item = await asyncStorageService.getObject<CacheItem>(cacheKey);
        if (item && item.expiresAt && Date.now() > item.expiresAt) {
          expiredItems++;
        }
      }

      return {
        memorySize: this.memoryCache.size,
        persistentSize: index.length,
        totalItems: index.length,
        expiredItems,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        memorySize: 0,
        persistentSize: 0,
        totalItems: 0,
        expiredItems: 0,
      };
    }
  }

  // Clean up expired items
  async cleanup(): Promise<number> {
    try {
      const index = await this.getCacheIndex();
      const expiredKeys: string[] = [];

      for (const key of index) {
        const cacheKey = this.getCacheKey(key);
        const item = await asyncStorageService.getObject<CacheItem>(cacheKey);
        
        if (!item || 
            (item.expiresAt && Date.now() > item.expiresAt) ||
            (item.version && item.version !== this.config.version)) {
          expiredKeys.push(key);
        }
      }

      // Remove expired items
      const removePromises = expiredKeys.map(key => this.remove(key));
      await Promise.all(removePromises);

      console.log(`Cleaned up ${expiredKeys.length} expired cache items`);
      return expiredKeys.length;
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
      return 0;
    }
  }

  // Get or set pattern (if key doesn't exist, call factory function)
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await factory();
      await this.set(key, value, ttl);
    }
    
    return value;
  }

  // Batch operations
  async setMany<T>(items: Array<{key: string; value: T; ttl?: number}>): Promise<void> {
    const setPromises = items.map(item => 
      this.set(item.key, item.value, item.ttl)
    );
    await Promise.all(setPromises);
  }

  async getMany<T>(keys: string[]): Promise<Array<{key: string; value: T | null}>> {
    const getPromises = keys.map(async key => ({
      key,
      value: await this.get<T>(key),
    }));
    
    return Promise.all(getPromises);
  }

  async removeMany(keys: string[]): Promise<void> {
    const removePromises = keys.map(key => this.remove(key));
    await Promise.all(removePromises);
  }

  // Cache index management
  private async getCacheIndex(): Promise<string[]> {
    try {
      const index = await asyncStorageService.getObject<string[]>(this.CACHE_INDEX_KEY);
      return index || [];
    } catch (error) {
      console.error('Failed to get cache index:', error);
      return [];
    }
  }

  private async updateCacheIndex(key: string): Promise<void> {
    try {
      const index = await this.getCacheIndex();
      if (!index.includes(key)) {
        index.push(key);
        await asyncStorageService.setObject(this.CACHE_INDEX_KEY, index);
      }
    } catch (error) {
      console.error('Failed to update cache index:', error);
    }
  }

  private async removeCacheIndex(key: string): Promise<void> {
    try {
      const index = await this.getCacheIndex();
      const newIndex = index.filter(item => item !== key);
      await asyncStorageService.setObject(this.CACHE_INDEX_KEY, newIndex);
    } catch (error) {
      console.error('Failed to remove from cache index:', error);
    }
  }

  // Clean up if cache size exceeds maximum
  private async cleanupIfNeeded(): Promise<void> {
    if (!this.config.maxSize) return;

    try {
      const index = await this.getCacheIndex();
      
      if (index.length > this.config.maxSize) {
        // Remove oldest items first
        const itemsWithTimestamp: Array<{key: string; timestamp: number}> = [];
        
        for (const key of index) {
          const cacheKey = this.getCacheKey(key);
          const item = await asyncStorageService.getObject<CacheItem>(cacheKey);
          if (item) {
            itemsWithTimestamp.push({
              key,
              timestamp: item.timestamp,
            });
          }
        }

        // Sort by timestamp (oldest first)
        itemsWithTimestamp.sort((a, b) => a.timestamp - b.timestamp);

        // Remove excess items
        const itemsToRemove = itemsWithTimestamp.slice(0, index.length - this.config.maxSize);
        const removePromises = itemsToRemove.map(item => this.remove(item.key));
        await Promise.all(removePromises);

        console.log(`Removed ${itemsToRemove.length} old cache items to maintain size limit`);
      }
    } catch (error) {
      console.error('Failed to cleanup cache size:', error);
    }
  }

  // Update cache configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): CacheConfig {
    return { ...this.config };
  }
}

export const cacheService = CacheService.getInstance();
export default cacheService;

