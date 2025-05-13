
/**
 * Optimized utility functions for working with browser storage with improved performance
 */

// Configuration constants
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MEMORY_CACHE_MAX_ITEMS = 100; // Maximum items in memory cache

// Cache commonly used items in memory to reduce storage read operations
const memoryCache: Record<string, { value: any, timestamp: number }> = {};

// Helper function to cleanup memory cache when it gets too large
const cleanupMemoryCache = () => {
  const keys = Object.keys(memoryCache);
  if (keys.length <= MEMORY_CACHE_MAX_ITEMS) return;
  
  // Sort by timestamp (oldest first)
  const sortedKeys = keys.sort((a, b) => 
    memoryCache[a].timestamp - memoryCache[b].timestamp
  );
  
  // Remove the oldest 20% of items
  const removeCount = Math.ceil(keys.length * 0.2);
  for (let i = 0; i < removeCount; i++) {
    if (i < sortedKeys.length) {
      delete memoryCache[sortedKeys[i]];
    }
  }
};

// Helper for type-safe storage operations with improved performance
export const storageUtils = {
  // Local Storage
  setLocalItem: <T>(key: string, value: T): void => {
    try {
      // Check if cleanup is needed
      cleanupMemoryCache();
      
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
      // Check if cleanup is needed
      cleanupMemoryCache();
      
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
  
  // Get all keys from storage - useful for debugging and cache invalidation
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
