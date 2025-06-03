
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
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
  
  // Convert Supabase user to our User type with proper typing
  const convertSupabaseUser = (supabaseUser: SupabaseUser) => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
    user_metadata: supabaseUser.user_metadata,
    app_metadata: supabaseUser.app_metadata,
    aud: supabaseUser.aud
  });
  
  // Methods to update authentication state
  const setAuthenticated = (user: SupabaseUser | null, session: Session | null, isPremium: boolean = false) => {
    setState({
      isLoading: false,
      isAuthenticated: !!user,
      user: user ? convertSupabaseUser(user) : null,
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
      storeSession(newSession, remember);
    }
    
    const isPremium = newSession.user ? await checkPremiumStatus(newSession.user.id) : false;
    setAuthenticated(newSession.user, newSession, isPremium);
  };
  
  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Set up auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state changed:', event, !!session);
            
            if (event === 'SIGNED_IN' && session) {
              const storedSession = getStoredSession();
              const remember = !!storedSession;
              await updateAuthState(session, remember);
            } else if (event === 'SIGNED_OUT') {
              setAuthenticated(null, null);
              clearStoredSession();
            } else if (event === 'TOKEN_REFRESHED' && session) {
              const storedSession = getStoredSession();
              const remember = !!storedSession;
              await updateAuthState(session, remember);
            }
          }
        );
        
        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthenticated(null, null);
        } else if (data.session) {
          const storedSession = getStoredSession();
          const remember = !!storedSession;
          await updateAuthState(data.session, remember);
        } else {
          setAuthenticated(null, null);
        }
        
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing authentication:', error);
        if (mounted) {
          setAuthenticated(null, null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    const cleanup = initialize();
    
    return () => {
      mounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);
  
  return {
    authState,
    updateAuthState
  };
};
