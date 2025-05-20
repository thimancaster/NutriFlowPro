
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { dbCache } from '@/services/dbCacheService';
import { executeWithRetry, checkSupabaseHealth } from '@/utils/supabaseUtils';
import { PREMIUM_EMAILS } from '@/constants/subscriptionConstants';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime
const CACHE_NAME = 'premium-status';

/**
 * Hook to check premium status of a user
 */
export const usePremiumCheck = () => {
  /**
   * Check if a user has premium status using optimized caching and circuit breaker pattern
   */
  const checkPremiumStatus = useCallback(async (userId: string | undefined) => {
    if (!userId) return false;
    
    try {
      // Try to get from cache first to avoid unnecessary API calls
      const cachedStatus = dbCache.get<boolean>(CACHE_NAME, userId, CACHE_TTL);
      if (cachedStatus !== undefined) {
        console.log("Using cached premium status:", cachedStatus);
        return cachedStatus;
      }
      
      // First, try email check which doesn't require database query
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email && PREMIUM_EMAILS.includes(userData.user.email)) {
        console.log("User premium via email:", userData.user.email);
        dbCache.set(CACHE_NAME, userId, true);
        return true;
      }
      
      // Check if Supabase is available before making RPC call
      const isSupabaseHealthy = await checkSupabaseHealth();
      if (!isSupabaseHealthy) {
        console.warn("Supabase service appears to be unavailable, using email check fallback");
        const emailResult = userData?.user?.email ? PREMIUM_EMAILS.includes(userData.user.email) : false;
        dbCache.set(CACHE_NAME, userId, emailResult);
        return emailResult;
      }
      
      // Try RPC function with enhanced retry logic
      const result = await executeWithRetry<boolean>(async () => {
        const { data, error } = await supabase.rpc('check_user_premium_status', { user_id: userId });
        
        if (error) {
          console.error("Error checking premium status via RPC:", error);
          throw error;
        }
        
        return !!data;
      });
      
      // Cache the result
      dbCache.set(CACHE_NAME, userId, result);
      return result;
    } catch (error) {
      console.error("Failed to check premium status:", error);
      
      // Final fallback to email
      try {
        const { data: userData } = await supabase.auth.getUser();
        const emailResult = userData?.user?.email ? PREMIUM_EMAILS.includes(userData.user.email) : false;
        dbCache.set(CACHE_NAME, userId, emailResult);
        return emailResult;
      } catch (e) {
        console.error("Even email fallback failed:", e);
        return false;
      }
    }
  }, []);
  
  return { checkPremiumStatus };
};
