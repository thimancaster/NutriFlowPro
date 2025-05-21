
import { storageUtils } from '@/utils/storageUtils';

export interface DBCacheInterface {
  KEYS: Record<string, string>;
  get: (key: string, defaultValue?: any) => any;
  set: (key: string, data: any) => void;
  invalidate: (keyOrPrefix: string) => void;
  invalidateAll: () => void;
}

export const dbCache: DBCacheInterface = {
  // Cache key prefixes
  KEYS: {
    PATIENT: 'db_cache_patient_',
    PATIENTS: 'db_cache_patients',
    CONSULTATIONS: 'db_cache_consultations_',
    MEAL_PLANS: 'db_cache_meal_plans_',
    FOOD_DATABASE: 'db_cache_food_database',
  },
  
  /**
   * Get data from cache
   */
  get: (key: string, defaultValue?: any) => {
    try {
      const cachedData = storageUtils.getLocalItem(key);
      if (cachedData !== null && cachedData !== undefined) {
        return cachedData;
      }
    } catch (error) {
      console.error('Cache error:', error);
    }
    return defaultValue;
  },
  
  /**
   * Set data in cache
   */
  set: (key: string, data: any) => {
    try {
      storageUtils.setLocalItem(key, data);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
  
  /**
   * Invalidate cache by key or prefix
   */
  invalidate: (keyOrPrefix: string) => {
    try {
      // If it's an exact key match, simply remove it
      storageUtils.removeLocalItem(keyOrPrefix);
      
      // Also check if it's a prefix and remove all matching keys
      // This requires us to add a helper to storageUtils
      const keys = getAllLocalStorageKeys();
      keys.forEach(key => {
        if (key.startsWith(keyOrPrefix)) {
          storageUtils.removeLocalItem(key);
        }
      });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  },
  
  /**
   * Invalidate all cache entries
   */
  invalidateAll: () => {
    try {
      Object.values(dbCache.KEYS).forEach(key => {
        dbCache.invalidate(key);
      });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
};

// Helper function to get all localStorage keys
function getAllLocalStorageKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
}
