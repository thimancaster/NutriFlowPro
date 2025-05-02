
import { useAuth } from '@/contexts/AuthContext';

export const useAuthState = () => {
  // We'll simply return the values from our useAuth hook for backwards compatibility
  return useAuth();
};
