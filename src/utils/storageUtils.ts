
/**
 * Utility functions for working with browser storage with optimized performance
 */

// Cache commonly used items in memory to reduce storage read operations
const memoryCache: Record<string, { value: any, timestamp: number }> = {};
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper for type-safe storage operations
export const storageUtils = {
  // Local Storage
  setLocalItem: <T>(key: string, value: T): void => {
    try {
      // Add to memory cache first
      memoryCache[`local_${key}`] = { 
        value,
        timestamp: Date.now()
      };
      
      // Then save to localStorage
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  },

  getLocalItem: <T>(key: string): T | null => {
    try {
      // Check memory cache first
      const cacheKey = `local_${key}`;
      if (memoryCache[cacheKey] && 
          (Date.now() - memoryCache[cacheKey].timestamp) < MEMORY_CACHE_TTL) {
        return memoryCache[cacheKey].value as T;
      }
      
      // If not in memory cache or expired, get from localStorage
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Parse and update memory cache
      const parsedValue = JSON.parse(item) as T;
      memoryCache[cacheKey] = {
        value: parsedValue,
        timestamp: Date.now()
      };
      
      return parsedValue;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  },

  removeLocalItem: (key: string): void => {
    try {
      // Remove from memory cache
      delete memoryCache[`local_${key}`];
      
      // Remove from localStorage
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  },

  // Session Storage
  setSessionItem: <T>(key: string, value: T): void => {
    try {
      // Add to memory cache first
      memoryCache[`session_${key}`] = { 
        value,
        timestamp: Date.now()
      };
      
      // Then save to sessionStorage
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  },

  getSessionItem: <T>(key: string): T | null => {
    try {
      // Check memory cache first
      const cacheKey = `session_${key}`;
      if (memoryCache[cacheKey] && 
          (Date.now() - memoryCache[cacheKey].timestamp) < MEMORY_CACHE_TTL) {
        return memoryCache[cacheKey].value as T;
      }
      
      // If not in memory cache or expired, get from sessionStorage
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      
      // Parse and update memory cache
      const parsedValue = JSON.parse(item) as T;
      memoryCache[cacheKey] = {
        value: parsedValue,
        timestamp: Date.now()
      };
      
      return parsedValue;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return null;
    }
  },

  removeSessionItem: (key: string): void => {
    try {
      // Remove from memory cache
      delete memoryCache[`session_${key}`];
      
      // Remove from sessionStorage
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  },
  
  // Clear all storage
  clearAll: (): void => {
    try {
      // Clear memory cache
      Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
      
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
  
  // Clear memory cache only (useful for testing or freeing memory)
  clearMemoryCache: (): void => {
    Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
  },
  
  // Get all keys from storage - useful for debugging
  getAllKeys: (): {local: string[], session: string[]} => {
    const localKeys: string[] = [];
    const sessionKeys: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) localKeys.push(key);
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) sessionKeys.push(key);
      }
    } catch (error) {
      console.error('Error getting storage keys:', error);
    }
    
    return { local: localKeys, session: sessionKeys };
  }
};
