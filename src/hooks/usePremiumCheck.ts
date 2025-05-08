
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePremiumCheck = () => {
  const checkPremiumStatus = useCallback(async (userId: string | undefined) => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase.rpc('check_user_premium_status', {
        user_id: userId
      });
      
      if (error) {
        console.error("Error checking premium status:", error);
        // Fallback to email check if RPC fails
        const { data: userData } = await supabase.auth.getUser();
        return userData?.user?.email ? 
          ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'].includes(userData.user.email) 
          : false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  }, []);
  
  return { checkPremiumStatus };
};
