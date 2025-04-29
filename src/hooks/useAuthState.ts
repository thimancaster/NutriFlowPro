
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean | null;
  user: User | null;
  session: Session | null;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    user: null,
    session: null
  });

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          isAuthenticated: !!session,
          user: session?.user || null,
          session: session
        });
      }
    );

    // Then check for existing session
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthState({
        isAuthenticated: !!data.session,
        user: data.session?.user || null,
        session: data.session
      });
    };

    checkAuth();

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
