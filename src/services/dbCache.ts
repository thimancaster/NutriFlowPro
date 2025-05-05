
import { storageUtils } from "@/utils/storageUtils";

// Constants for optimized caching
const CACHE_KEYS = {
  PATIENT: 'db_patient_',
  CONSULTATIONS: 'db_consultations_',
  MEAL_PLANS: 'db_meal_plans_'
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Utility functions for managing database operation cache
 */
export const dbCache = {
  get: <T>(key: string): { data: T, timestamp: number } | null => {
    const cachedData = storageUtils.getSessionItem<{ data: T, timestamp: number }>(key);
    if (!cachedData) return null;
    
    // Check if cache is still valid
    if (Date.now() - cachedData.timestamp > CACHE_TTL) {
      storageUtils.removeSessionItem(key);
      return null;
    }
    
    return cachedData;
  },
  
  set: <T>(key: string, data: T): void => {
    storageUtils.setSessionItem(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  invalidate: (keyPrefix: string, id?: string): void => {
    if (id) {
      // Invalidate specific cache entry
      storageUtils.removeSessionItem(`${keyPrefix}${id}`);
    } else {
      // Find and remove all cache entries with this prefix
      // Since we can't enumerate sessionStorage, we'll focus on known keys
      Object.values(CACHE_KEYS).forEach(key => {
        if (key.startsWith(keyPrefix)) {
          storageUtils.removeSessionItem(key);
        }
      });
    }
  },

  // Export cache keys for use in other services
  KEYS: CACHE_KEYS
};
