/**
 * Web-compatible AsyncStorage for React Native
 * Complete replacement that never throws window errors
 */

// In-memory fallback storage for SSR or when localStorage fails
let memoryStorage = {};

// Check if we can use localStorage
const canUseLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && 
           window.localStorage && 
           window.localStorage.setItem &&
           window.localStorage.getItem;
  } catch {
    return false;
  }
};

const AsyncStorage = {
  getItem: async (key) => {
    try {
      if (canUseLocalStorage()) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    } catch {
      return memoryStorage[key] || null;
    }
  },
  
  setItem: async (key, value) => {
    try {
      if (canUseLocalStorage()) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    } catch {
      memoryStorage[key] = value;
    }
  },

  removeItem: async (key) => {
    try {
      if (canUseLocalStorage()) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },

  clear: async () => {
    try {
      if (canUseLocalStorage()) {
        window.localStorage.clear();
      }
      memoryStorage = {};
    } catch {
      memoryStorage = {};
    }
  },

  getAllKeys: async () => {
    try {
      if (canUseLocalStorage()) {
        return Object.keys(window.localStorage);
      }
      return Object.keys(memoryStorage);
    } catch {
      return Object.keys(memoryStorage);
    }
  },

  multiGet: async (keys) => {
    const results = [];
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        results.push([key, value]);
      } catch {
        results.push([key, null]);
      }
    }
    return results;
  },

  multiSet: async (keyValuePairs) => {
    for (const [key, value] of keyValuePairs) {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        // Ignore errors
      }
    }
  },

  multiRemove: async (keys) => {
    for (const key of keys) {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        // Ignore errors
      }
    }
  },
};

module.exports = AsyncStorage;