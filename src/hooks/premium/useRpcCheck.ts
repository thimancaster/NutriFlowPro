
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { executeWithRetry, checkSupabaseHealth } from './utils';
import { PREMIUM_CHECK_CONSTANTS } from './constants';

/**
 * Hook to check premium status using RPC function
 */
export const useRpcCheck = () => {
  /**
   * Check premium status via RPC function with health check and retries
   */
  const checkPremiumViaRpc = useCallback(async (userId: string): Promise<boolean> => {
    // Check if Supabase is available before making RPC call
    const isSupabaseHealthy = await checkSupabaseHealth();
    if (!isSupabaseHealthy) {
      console.warn("Supabase service appears to be unavailable");
      return false;
    }
    
    // Try RPC function with enhanced retry logic
    try {
      return await executeWithRetry<boolean>(async () => {
        const { data, error } = await supabase.rpc('check_user_premium_status', { user_id: userId });
        
        if (error) {
          console.error("Error checking premium status via RPC:", error);
          throw error;
        }
        
        return !!data;
      });
    } catch (error) {
      console.error("Failed to check premium status via RPC:", error);
      return false;
    }
  }, []);
  
  return { checkPremiumViaRpc };
};
