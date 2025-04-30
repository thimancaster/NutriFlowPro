
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from './useUserSubscription';

// Lista centralizada de emails premium
export const PREMIUM_EMAILS = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];

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
  
  // Função para atualizar estado de autenticação de forma consistente
  const updateAuthState = useCallback((session: Session | null) => {
    console.log("Atualizando estado de autenticação:", session ? "Autenticado" : "Não autenticado");
    const user = session?.user || null;
    
    setAuthState({
      isAuthenticated: !!session,
      user: user,
      session: session,
      isLoading: false,
    });

    // Se o usuário estiver autenticado, garantir que os dados de assinatura sejam atualizados
    if (user?.id) {
      console.log("Usuário autenticado, verificando status de assinatura para:", user.email);
      // Usar setTimeout para evitar deadlocks na API do Supabase
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
      }, 0);
    }
  }, [queryClient]);

  // Função de logout que pode ser chamada de qualquer componente
  const logout = useCallback(async () => {
    try {
      console.log("Iniciando processo de logout");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Logout bem-sucedido, limpando cache");
      // Limpar o cache e estado
      queryClient.clear();
      
      // Forçar redirecionamento após logout
      updateAuthState(null);
      
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso."
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [queryClient, toast, updateAuthState]);

  useEffect(() => {
    let isMounted = true;
    
    console.log("Inicializando hook useAuthState");
    
    // Configurar o listener de estado de autenticação primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);

        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso."
          });
          
          // Limpar cache de assinatura ao fazer logout
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
          queryClient.clear();
          
        } else if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado",
            description: "Você foi autenticado com sucesso."
          });
        }

        updateAuthState(session);
      }
    );

    // Verificação explícita da sessão atual
    const checkExistingSession = async () => {
      try {
        console.log("Verificando sessão existente...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao obter sessão:", error);
          throw error;
        }
        
        // Verificação adicional para garantir que a sessão é válida
        if (data.session && data.session.user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            console.log("Sessão inválida detectada, realizando logout");
            await supabase.auth.signOut();
            if (isMounted) updateAuthState(null);
            return;
          }
        }
        
        if (isMounted) {
          updateAuthState(data.session);
          console.log("Status de autenticação após verificação:", data.session ? "Autenticado" : "Não autenticado");
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            isLoading: false,
          });
        }
      }
    };

    checkExistingSession();

    // Limpar inscrição ao desmontar
    return () => {
      console.log("Desmontando hook useAuthState");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast, queryClient, updateAuthState]);

  // Disponibilizar o método de logout junto com o estado
  return {
    ...authState,
    logout,
    isPremium: authState.user?.email ? PREMIUM_EMAILS.includes(authState.user.email) : false
  };
};
