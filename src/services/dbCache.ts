
import { storageUtils } from "@/utils/storageUtils";

// Constants for optimized caching
const CACHE_KEYS = {
  PATIENT: 'db_patient_',
  CONSULTATIONS: 'db_consultations_',
  MEAL_PLANS: 'db_meal_plans_'
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_ITEMS = 50; // Maximum number of items to keep in cache

/**
 * Utility functions for managing database operation cache with improved performance
 */
export const dbCache = {
  // Internal cache tracking for better cache management
  _cacheEntries: new Map<string, number>(), // Track cache entry timestamps
  
  get: <T>(key: string): { data: T, timestamp: number } | null => {
    const cachedData = storageUtils.getSessionItem<{ data: T, timestamp: number }>(key);
    if (!cachedData) return null;
    
    // Check if cache is still valid
    if (Date.now() - cachedData.timestamp > CACHE_TTL) {
      dbCache.invalidate(key);
      return null;
    }
    
    // Update cache entry tracking
    dbCache._cacheEntries.set(key, Date.now());
    
    return cachedData;
  },
  
  set: <T>(key: string, data: T): void => {
    // Check if we need to evict items from cache
    if (dbCache._cacheEntries.size >= CACHE_MAX_ITEMS) {
      dbCache._evictOldestEntries();
    }
    
    // Save to storage
    storageUtils.setSessionItem(key, {
      data,
      timestamp: Date.now()
    });
    
    // Update cache tracking
    dbCache._cacheEntries.set(key, Date.now());
  },
  
  invalidate: (keyPrefix: string, id?: string): void => {
    if (id) {
      // Invalidate specific cache entry
      const fullKey = `${keyPrefix}${id}`;
      storageUtils.removeSessionItem(fullKey);
      dbCache._cacheEntries.delete(fullKey);
    } else {
      // Find and remove all cache entries with this prefix
      const keysToRemove: string[] = [];
      
      // Use the storageUtils to get all keys
      const allKeys = storageUtils.getAllKeys().session;
      
      // Filter keys that match the prefix
      allKeys.forEach(key => {
        if (key.startsWith(keyPrefix)) {
          keysToRemove.push(key);
          storageUtils.removeSessionItem(key);
          dbCache._cacheEntries.delete(key);
        }
      });
      
      // Also remove any keys by prefix in our cache tracking
      dbCache._cacheEntries.forEach((_, trackingKey) => {
        if (trackingKey.startsWith(keyPrefix)) {
          dbCache._cacheEntries.delete(trackingKey);
        }
      });
    }
  },
  
  // Helper to evict oldest entries when cache gets too large
  _evictOldestEntries: (): void => {
    // Sort entries by timestamp (oldest first)
    const entries = Array.from(dbCache._cacheEntries.entries())
      .sort((a, b) => a[1] - b[1]);
    
    // Remove oldest 10% of entries
    const removeCount = Math.max(1, Math.floor(entries.length * 0.1));
    
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      const key = entries[i][0];
      storageUtils.removeSessionItem(key);
      dbCache._cacheEntries.delete(key);
    }
  },

  // Export cache keys for use in other services
  KEYS: CACHE_KEYS
};
