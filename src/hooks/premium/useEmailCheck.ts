
import { useCallback } from 'react';
import { PREMIUM_CHECK_CONSTANTS } from './constants';
import { isDeveloperEmail, isPremiumEmail } from './utils';

/**
 * Hook to check premium status based on email
 */
export const useEmailCheck = () => {
  /**
   * Check if an email has premium or developer status
   */
  const checkEmailStatus = useCallback((email: string | null | undefined): { 
    isPremium: boolean; 
    isDeveloper: boolean;
  } => {
    if (!email) {
      return { isPremium: false, isDeveloper: false };
    }

    const isDeveloper = isDeveloperEmail(email);
    
    // Developer emails automatically have premium access
    if (isDeveloper) {
      return { isPremium: true, isDeveloper: true };
    }
    
    // Then check for premium emails
    const isPremium = isPremiumEmail(email);
    return { isPremium, isDeveloper: false };
  }, []);
  
  return { checkEmailStatus };
};
