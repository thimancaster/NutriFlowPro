
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { validatePremiumStatus } from '@/utils/subscriptionUtils';

export const usePremiumStatus = (user: User | null) => {
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      return;
    }
    
    // Use the secure database function to validate premium status
    const checkPremium = async () => {
      try {
        const result = await validatePremiumStatus(user.id, user.email);
        setIsPremium(result);
      } catch (err) {
        console.error("Error checking premium status:", err);
        setIsPremium(false);
      }
    };
    
    checkPremium();
  }, [user?.id, user?.email]);
  
  return isPremium;
};
