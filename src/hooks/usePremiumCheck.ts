
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay
const PREMIUM_EMAILS = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];

/**
 * Retry a function with exponential backoff
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Wait with exponential backoff
    const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
    console.log(`Retry premium check in ${delay}ms... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1);
  }
}

export const usePremiumCheck = () => {
  const checkPremiumStatus = useCallback(async (userId: string | undefined) => {
    if (!userId) return false;
    
    try {
      // First, try a quick email check (no database query needed)
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email && PREMIUM_EMAILS.includes(userData.user.email)) {
        console.log("User premium via email:", userData.user.email);
        return true;
      }
      
      // Try the RPC function with retry logic
      return await retryOperation(async () => {
        const { data, error } = await supabase.rpc('check_user_premium_status', {
          user_id: userId
        });
        
        if (error) {
          console.error("Error checking premium status via RPC:", error);
          throw error;
        }
        
        return !!data;
      });
    } catch (error) {
      console.error("All attempts to check premium status failed:", error);
      
      // Final fallback to email
      try {
        const { data: userData } = await supabase.auth.getUser();
        return userData?.user?.email ? 
          PREMIUM_EMAILS.includes(userData.user.email) 
          : false;
      } catch (e) {
        console.error("Even email fallback failed:", e);
        return false;
      }
    }
  }, []);
  
  return { checkPremiumStatus };
};
