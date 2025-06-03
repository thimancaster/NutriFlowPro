
import { supabase } from '@/integrations/supabase/client';

export const usePremiumCheck = () => {
  const checkPremiumStatus = async (userId: string): Promise<boolean> => {
    try {
      // Check if user is premium using the database function
      const { data, error } = await supabase.rpc('check_user_premium_status', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error checking premium status:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Error in premium check:', error);
      return false;
    }
  };

  return { checkPremiumStatus };
};
