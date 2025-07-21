
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import useAuthStorage from '@/hooks/auth/useAuthStorage';
import { usePremiumCheck } from '@/hooks/premium';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
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
  
  // Set authentication state
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
  
  // Update session with better error handling and cleanup
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
      
      // Clean up on error
      setAuthenticated(null, null);
      clearStoredSession();
      
      toast({
        title: "Erro de Autenticação",
        description: "Sessão inválida detectada. Por favor, faça login novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Initialize auth state with improved error handling
  useEffect(() => {
    let mounted = true;
    let subscription: any;
    
    const initialize = async () => {
      try {
        if (!mounted) return;
        
        setLoading(true);
        
        // Set up auth state change listener first
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state changed:', event, !!session);
            
            try {
              // Handle different auth events
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
              } else if (event === 'TOKEN_REFRESHED' && !session) {
                // Token refresh failed - clean up and sign out
                console.warn('Token refresh failed, signing out user');
                setAuthenticated(null, null);
                clearStoredSession();
                
                toast({
                  title: "Sessão Expirada",
                  description: "Sua sessão expirou. Por favor, faça login novamente.",
                  variant: "destructive"
                });
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
        
        subscription = data.subscription;
        
        // Then check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setAuthenticated(null, null);
            clearStoredSession();
          }
        } else if (sessionData.session && mounted) {
          const storedSession = getStoredSession();
          const remember = !!storedSession;
          await updateAuthState(sessionData.session, remember);
        } else if (mounted) {
          setAuthenticated(null, null);
        }
        
      } catch (error) {
        console.error('Error initializing authentication:', error);
        if (mounted) {
          setAuthenticated(null, null);
          clearStoredSession();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  return {
    authState,
    updateAuthState
  };
};
