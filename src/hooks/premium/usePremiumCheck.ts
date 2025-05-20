
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useEmailCheck } from './useEmailCheck';
import { useRpcCheck } from './useRpcCheck';
import { useCacheManager } from './useCacheManager';

/**
 * Main hook to check premium status of a user
 * Refactored to use smaller, focused hooks
 */
export const usePremiumCheck = () => {
  const { checkEmailStatus } = useEmailCheck();
  const { checkPremiumViaRpc } = useRpcCheck();
  const { getPremiumFromCache, savePremiumToCache } = useCacheManager();
  
  /**
   * Check if a user has premium status using optimized caching and circuit breaker pattern
   */
  const checkPremiumStatus = useCallback(async (userId: string | undefined) => {
    if (!userId) return false;
    
    try {
      // Try to get from cache first to avoid unnecessary API calls
      const cachedStatus = getPremiumFromCache(userId);
      if (cachedStatus !== undefined) {
        console.log("Using cached premium status:", cachedStatus);
        return cachedStatus;
      }
      
      // First, try email check which doesn't require database query
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;
      
      // Check email status (both developer and premium)
      const { isPremium: isEmailPremium, isDeveloper } = checkEmailStatus(userEmail);
      
      if (isDeveloper) {
        console.log("User is a developer with full access:", userEmail);
        savePremiumToCache(userId, true);
        return true;
      }
      
      if (isEmailPremium) {
        console.log("User premium via email:", userEmail);
        savePremiumToCache(userId, true);
        return true;
      }
      
      // If not premium by email, check via RPC
      const rpcResult = await checkPremiumViaRpc(userId);
      
      // Cache the result
      savePremiumToCache(userId, rpcResult);
      return rpcResult;
    } catch (error) {
      console.error("Failed to check premium status:", error);
      
      // Final fallback - check via email
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData?.user?.email;
        
        // Check email status again as fallback
        const { isPremium: isEmailPremium, isDeveloper } = checkEmailStatus(userEmail);
        
        if (isDeveloper || isEmailPremium) {
          const result = isDeveloper || isEmailPremium;
          savePremiumToCache(userId, result);
          return result;
        }
      } catch (e) {
        console.error("Even email fallback failed:", e);
      }
      
      return false;
    }
  }, [checkEmailStatus, checkPremiumViaRpc, getPremiumFromCache, savePremiumToCache]);
  
  return { checkPremiumStatus };
};

// Re-export for backward compatibility
export default usePremiumCheck;
