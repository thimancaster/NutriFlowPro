
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthState } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStorage } from '@/hooks/auth/useAuthStorage';
import { usePremiumCheck } from '@/hooks/premium';
import { useUsageQuota } from '@/hooks/useUsageQuota';

// Initial auth state
const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isPremium: false,
  loading: true,
  userTier: 'free',
  usageQuota: {
    patients: {
      used: 0,
      limit: 5,
    },
    mealPlans: {
      used: 0,
      limit: 3,
    },
  },
};

const useAuthStateManager = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const { isPremiumUser } = usePremiumCheck();
  const authStorage = useAuthStorage();
  const usageQuota = useUsageQuota(authState.user, isPremiumUser);
  
  // Update auth state with session and premium status
  const updateAuthState = useCallback(
    async (session: Session | null, remember: boolean = false) => {
      if (session) {
        // Store session if remember me is checked
        if (remember) {
          authStorage.storeSession(session, true);
        }
        
        const user = session.user;
        
        setAuthState((prev) => ({
          ...prev,
          user,
          session,
          isAuthenticated: true,
          isLoading: false,
          loading: false,
          isPremium: isPremiumUser,
          userTier: isPremiumUser ? 'premium' : 'free',
        }));
      } else {
        // If session is null, user is logged out
        setAuthState((prev) => ({
          ...prev,
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          loading: false,
          isPremium: false,
          userTier: 'free',
        }));
      }
    },
    [isPremiumUser, authStorage]
  );
  
  // Effect to set up auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        await updateAuthState(session);
      }
    );
    
    // Check for stored session on mount
    const checkSession = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        await updateAuthState(session);
      } catch (error) {
        console.error('Error checking session:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          loading: false
        }));
      }
    };
    
    checkSession();
    
    // Cleanup subscription when unmounting
    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);
  
  // Update usage quota when user changes
  useEffect(() => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        usageQuota
      }));
    }
  }, [usageQuota, authState.user]);
  
  return {
    authState,
    updateAuthState,
  };
};

export default useAuthStateManager;
