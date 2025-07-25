
import { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, User } from '@/types/auth';
import { useAuthStorage } from '@/hooks/auth/useAuthStorage';

export const useAuthStateManager = () => {
  const { storeSession, getStoredSession, clearStoredSession } = useAuthStorage();
  
  const [authState, setAuthState] = useState<AuthState & { 
    loading: boolean; 
    isPremium: boolean; 
    userTier: string; 
    usageQuota: any 
  }>({
    user: null,
    session: null,
    isLoading: true,
    loading: true,
    isAuthenticated: false,
    isPremium: false,
    userTier: 'free',
    usageQuota: null
  });

  // Convert Supabase user to our User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
  });

  const updateAuthState = useCallback(async (session: Session | null, remember: boolean = false) => {
    if (session) {
      storeSession(session, remember);
      setAuthState(prev => ({
        ...prev,
        user: convertSupabaseUser(session.user),
        session,
        isAuthenticated: true,
        isLoading: false,
        loading: false
      }));
    } else {
      clearStoredSession();
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        loading: false
      }));
    }
  }, [storeSession, clearStoredSession]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateAuthState(session);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await updateAuthState(session);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          loading: false
        }));
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [updateAuthState]);

  return { authState, updateAuthState };
};
