
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
  
  // Update session with better error handling
  const updateAuthState = async (newSession: Session | null, remember: boolean = false) => {
    try {
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
    } catch (error) {
      console.error('Error updating auth state:', error);
      setAuthenticated(null, null);
      clearStoredSession();
    }
  };
  
  // Initialize auth state with improved error handling
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        if (!mounted) return;
        
        setLoading(true);
        
        // Check for existing session first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setAuthenticated(null, null);
          }
        } else if (sessionData.session && mounted) {
          const storedSession = getStoredSession();
          const remember = !!storedSession;
          await updateAuthState(sessionData.session, remember);
        } else if (mounted) {
          setAuthenticated(null, null);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state changed:', event, !!session);
            
            try {
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
            } catch (error) {
              console.error('Error handling auth state change:', error);
              if (mounted) {
                setAuthenticated(null, null);
                clearStoredSession();
              }
            }
          }
        );
        
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
