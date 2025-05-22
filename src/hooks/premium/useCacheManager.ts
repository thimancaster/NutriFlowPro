
import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { PREMIUM_CHECK_CONSTANTS } from './constants';

/**
 * Improved hook to manage premium status cache operations with throttling
 */
export const useCacheManager = () => {
  // In-memory cache to reduce localStorage reads
  const memCache = useRef<Map<string, {value: boolean, timestamp: number}>>(new Map());
  
  /**
   * Get premium status from cache
   */
  const getPremiumFromCache = useCallback((userId: string): boolean | undefined => {
    // First check in-memory cache for faster access
    const memCached = memCache.current.get(userId);
    if (memCached && Date.now() - memCached.timestamp < PREMIUM_CHECK_CONSTANTS.CACHE_TTL) {
      logger.debug(`Using memory cached premium status for ${userId}: ${memCached.value}`);
      return memCached.value;
    }
    
    // Then check localStorage
    try {
      const cacheKey = `${PREMIUM_CHECK_CONSTANTS.CACHE_PREFIX}${userId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { value, timestamp } = JSON.parse(cachedData);
        
        // Check if cache is still valid
        if (Date.now() - timestamp < PREMIUM_CHECK_CONSTANTS.CACHE_TTL) {
          // Store in memory cache for future fast access
          memCache.current.set(userId, { value, timestamp });
          logger.debug(`Using localStorage cached premium status for ${userId}: ${value}`);
          return value;
        }
      }
      return undefined;
    } catch (error) {
      logger.error('Error reading from cache:', error);
      return undefined;
    }
  }, []);
  
  /**
   * Save premium status to cache
   */
  const savePremiumToCache = useCallback((userId: string, isPremium: boolean): void => {
    try {
      const now = Date.now();
      const cacheData = {
        value: isPremium,
        timestamp: now
      };
      
      // Update memory cache
      memCache.current.set(userId, cacheData);
      
      // Update localStorage
      const cacheKey = `${PREMIUM_CHECK_CONSTANTS.CACHE_PREFIX}${userId}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      logger.debug(`Saved premium status to cache for ${userId}: ${isPremium}`);
    } catch (error) {
      logger.error('Error saving to cache:', error);
    }
  }, []);
  
  /**
   * Clear cache for a specific user
   */
  const clearUserCache = useCallback((userId: string): void => {
    memCache.current.delete(userId);
    try {
      const cacheKey = `${PREMIUM_CHECK_CONSTANTS.CACHE_PREFIX}${userId}`;
      localStorage.removeItem(cacheKey);
      logger.debug(`Cleared premium status cache for ${userId}`);
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }, []);
  
  return {
    getPremiumFromCache,
    savePremiumToCache,
    clearUserCache
  };
};
