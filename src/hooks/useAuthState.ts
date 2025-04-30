
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from './useUserSubscription';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    // Configurar o listener de estado de autenticação primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso."
          });
          
          // Limpar cache de assinatura ao fazer logout
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
        } else if (event === 'SIGNED_IN') {
          console.log("Usuário autenticado, atualizando status de assinatura");
          
          // Invalidar cache de assinatura ao fazer login
          if (session?.user) {
            queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, session.user.id] });
            
            // Verificar se o usuário é premium pelo email
            if (session.user.email === 'thimancaster@hotmail.com' || 
                session.user.email === 'thiago@nutriflowpro.com') {
              console.log("Usuário premium detectado pelo email:", session.user.email);
            }
          }
        }

        setAuthState({
          isAuthenticated: !!session,
          user: session?.user || null,
          session: session,
          isLoading: false,
        });
      }
    );

    // Em seguida, verificar a sessão existente
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Se tiver usuário autenticado, atualiza o cache de assinatura
        if (data.session?.user) {
          console.log("Sessão existente detectada, atualizando status de assinatura");
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, data.session.user.id] });
          
          // Verificar se o usuário é premium pelo email
          if (data.session.user.email === 'thimancaster@hotmail.com' || 
              data.session.user.email === 'thiago@nutriflowpro.com') {
            console.log("Usuário premium detectado pelo email:", data.session.user.email);
          }
        }
        
        setAuthState({
          isAuthenticated: !!data.session,
          user: data.session?.user || null,
          session: data.session,
          isLoading: false,
        });
      } catch (error) {
        console.error("Erro de autenticação:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          isLoading: false,
        });
      }
    };

    checkAuth();

    // Limpar inscrição ao desmontar
    return () => subscription.unsubscribe();
  }, [toast, queryClient]);

  return authState;
};
