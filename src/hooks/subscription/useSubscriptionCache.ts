
import { User } from "@supabase/supabase-js";
import { SubscriptionData } from "../useSubscriptionQuery";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache time
const memoryCache = new Map<string, {data: SubscriptionData, timestamp: number}>();

/**
 * Utility for caching subscription data locally
 */
export const subscriptionCache = {
  /**
   * Get subscription data from cache
   */
  get: (user: User | null): SubscriptionData | undefined => {
    const cacheKey = user?.id || 'anonymous';
    const cachedData = memoryCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
      return cachedData.data;
    }
    
    return undefined;
  },
  
  /**
   * Store subscription data in cache
   */
  set: (user: User | null, data: SubscriptionData): void => {
    const cacheKey = user?.id || 'anonymous';
    
    memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  },
  
  /**
   * Invalidate cache for a user
   */
  invalidate: (userId: string | undefined): void => {
    const cacheKey = userId || 'anonymous';
    memoryCache.delete(cacheKey);
  },
  
  /**
   * Clear all cache entries
   */
  clear: (): void => {
    memoryCache.clear();
  }
};
