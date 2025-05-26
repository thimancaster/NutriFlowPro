
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, User } from '@/types/auth';

export const useAuthStateManager = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Convert Supabase user to our User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prevState => ({
          ...prevState,
          user: session?.user ? convertSupabaseUser(session.user) : null,
          session: session,
          isAuthenticated: !!session,
          isLoading: false,
        }));
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prevState => ({
        ...prevState,
        user: session?.user ? convertSupabaseUser(session.user) : null,
        session: session,
        isAuthenticated: !!session,
        isLoading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
