
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';
import { PREMIUM_CHECK_CONSTANTS } from './constants';

/**
 * Hook to manage premium status cache operations using React Query
 */
export const useCacheManager = () => {
  const queryClient = useQueryClient();
  
  /**
   * Get premium status from React Query cache
   */
  const getPremiumFromCache = useCallback((userId: string): boolean | undefined => {
    const cacheKey = ['premium-status', userId];
    const cachedData = queryClient.getQueryData<{ value: boolean; timestamp: number }>(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < PREMIUM_CHECK_CONSTANTS.CACHE_TTL) {
      logger.debug(`Using cached premium status for ${userId}: ${cachedData.value}`);
      return cachedData.value;
    }
    
    return undefined;
  }, [queryClient]);
  
  /**
   * Save premium status to React Query cache
   */
  const savePremiumToCache = useCallback((userId: string, isPremium: boolean): void => {
    try {
      const cacheKey = ['premium-status', userId];
      const cacheData = {
        value: isPremium,
        timestamp: Date.now()
      };
      
      queryClient.setQueryData(cacheKey, cacheData);
      logger.debug(`Saved premium status to cache for ${userId}: ${isPremium}`);
    } catch (error) {
      logger.error('Error saving to cache:', error);
    }
  }, [queryClient]);
  
  /**
   * Clear cache for a specific user
   */
  const clearUserCache = useCallback((userId: string): void => {
    try {
      const cacheKey = ['premium-status', userId];
      queryClient.removeQueries({ queryKey: cacheKey });
      logger.debug(`Cleared premium status cache for ${userId}`);
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }, [queryClient]);
  
  return {
    getPremiumFromCache,
    savePremiumToCache,
    clearUserCache
  };
};
