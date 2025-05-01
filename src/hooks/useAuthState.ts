
import { useSessionInit } from './useSessionInit';
import { useAuthLogout } from './useAuthLogout';
import { usePremiumStatus } from './usePremiumStatus';

// Export for compatibility with other files that import this
export const PREMIUM_EMAILS = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];

export const useAuthState = () => {
  // Get session state
  const sessionState = useSessionInit();
  
  // Get logout function
  const logout = useAuthLogout();
  
  // Check premium status
  const isPremium = usePremiumStatus(sessionState.user);
  
  // Return combined values
  return {
    ...sessionState,
    logout,
    isPremium
  };
};
