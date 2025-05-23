
import { useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import { useToast } from '@/hooks/toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useUsageQuota } from '@/hooks/useUsageQuota';
import { usePremiumCheck } from '@/hooks/premium';
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';
import { useAuthSingleton } from '@/hooks/auth/useAuthSingleton';
import { logger } from '@/utils/logger';
import { useAuthStorage } from '@/hooks/auth/useAuthStorage';

const useAuthStateManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkPremiumStatus } = usePremiumCheck();
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Initialize state
  const [authState, setAuthState] = useState<AuthState>({
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
        limit: 5
      },
      mealPlans: {
        used: 0,
        limit: 3
      }
    }
  });

  // Get usage quota based on user and premium status
  const usageQuota = useUsageQuota(authState.user, authState.isPremium);
  
  // Use centralized auth storage functions
  const { storeSession: saveSession, getStoredSession: loadStoredSession, savePremiumStatus } = useAuthStorage();

  // Update auth state with consistent format and debounce premium checks
  const updateAuthState = useCallback(async (session: Session | null, remember: boolean = false) => {
    const user = session?.user || null;
    
    // Don't proceed if component is unmounted
    if (!isMountedRef.current) return;
    
    // Set basic auth state immediately for better UX
    setAuthState(prevState => ({
      ...prevState,
      user,
      session,
      isAuthenticated: !!session,
      isLoading: false,
      loading: false
    }));
    
    // Save session based on remember me preference
    saveSession(session, remember);
    
    // Record the last authentication check timestamp
    storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now());
    
    // Check premium status if user is logged in
    if (user?.id) {
      try {
        const isPremium = await checkPremiumStatus(user.id);
        const userTier = isPremium ? 'premium' : 'free';
        
        if (isMountedRef.current) {
          setAuthState(prevState => ({
            ...prevState,
            isPremium,
            userTier,
            usageQuota: {
              ...usageQuota,
              patients: {
                ...usageQuota.patients,
                limit: isPremium ? Infinity : usageQuota.patients.limit
              },
              mealPlans: {
                ...usageQuota.mealPlans,
                limit: isPremium ? Infinity : usageQuota.mealPlans.limit
              }
            }
          }));
        }
        
        // Store premium status in local storage with timestamp
        savePremiumStatus(user.id, isPremium);
      } catch (error) {
        logger.error("Error checking premium status:", { details: error });
      }
    }

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      // Use setTimeout to avoid doing this synchronously
      setTimeout(() => {
        if (isMountedRef.current) {
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
        }
      }, 0);
    }
  }, [checkPremiumStatus, queryClient, usageQuota, saveSession, savePremiumStatus]);
  
  // Use the singleton auth listener
  useAuthSingleton(setAuthState, loadStoredSession);

  // Initialize authentication state cleanup
  useCallback(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    authState,
    updateAuthState
  };
};

export default useAuthStateManager;
