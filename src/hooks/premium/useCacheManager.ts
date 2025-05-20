
import { useCallback } from 'react';
import { dbCache } from '@/services/dbCacheService';
import { PREMIUM_CHECK_CONSTANTS } from './constants';

/**
 * Hook to manage premium status cache operations
 */
export const useCacheManager = () => {
  /**
   * Get premium status from cache
   */
  const getPremiumFromCache = useCallback((userId: string): boolean | undefined => {
    return dbCache.get<boolean>(
      PREMIUM_CHECK_CONSTANTS.CACHE_NAME, 
      userId, 
      PREMIUM_CHECK_CONSTANTS.CACHE_TTL
    );
  }, []);
  
  /**
   * Save premium status to cache
   */
  const savePremiumToCache = useCallback((userId: string, isPremium: boolean): void => {
    dbCache.set(
      PREMIUM_CHECK_CONSTANTS.CACHE_NAME, 
      userId, 
      isPremium
    );
  }, []);
  
  return {
    getPremiumFromCache,
    savePremiumToCache
  };
};
