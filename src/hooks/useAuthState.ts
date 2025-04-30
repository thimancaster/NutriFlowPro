
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  isAuthenticated: boolean | null;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    user: null,
    session: null,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso."
          });
        }

        setAuthState({
          isAuthenticated: !!session,
          user: session?.user || null,
          session: session,
          isLoading: false,
        });
      }
    );

    // Then check for existing session
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setAuthState({
          isAuthenticated: !!data.session,
          user: data.session?.user || null,
          session: data.session,
          isLoading: false,
        });
      } catch (error) {
        console.error("Auth error:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          isLoading: false,
        });
      }
    };

    checkAuth();

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [toast]);

  return authState;
};
