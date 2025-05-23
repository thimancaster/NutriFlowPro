
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import useAuthStorage from '@/hooks/auth/useAuthStorage';
import { usePremiumCheck } from '@/hooks/premium';

export const useAuthStateManager = () => {
  const [authState, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    session: null,
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
  
  const { storeSession, getStoredSession, clearStoredSession } = useAuthStorage();
  const { checkPremiumStatus } = usePremiumCheck();
  
  // Methods to update authentication state
  const setAuthenticated = (user: User | null, session: Session | null, isPremium: boolean = false) => {
    setState({
      isLoading: false,
      isAuthenticated: !!user,
      user,
      session,
      isPremium,
      loading: false,
      userTier: isPremium ? 'premium' : 'free',
      usageQuota: {
        patients: {
          used: 0,
          limit: isPremium ? Infinity : 5
        },
        mealPlans: {
          used: 0,
          limit: isPremium ? Infinity : 3
        }
      }
    });
  };
  
  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, loading: isLoading }));
  };
  
  // Update session
  const updateAuthState = async (newSession: Session | null, remember: boolean = false) => {
    if (!newSession) {
      setAuthenticated(null, null);
      clearStoredSession();
      return;
    }
    
    if (remember) {
      storeSession(newSession);
    }
    
    const isPremium = newSession.user ? await checkPremiumStatus(newSession.user.id) : false;
    setAuthenticated(newSession.user, newSession, isPremium);
  };
  
  // Initialize auth state
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Try to get session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          const storedSession = getStoredSession();
          const remember = !!storedSession;
          
          await updateAuthState(data.session, remember);
        } else {
          setAuthenticated(null, null);
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setAuthenticated(null, null);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  return {
    authState,
    updateAuthState
  };
};
