
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from './useUserSubscription';

interface SessionState {
  isAuthenticated: boolean | null;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useSessionInit = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isAuthenticated: null,
    user: null,
    session: null,
    isLoading: true,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Function to update auth state consistently
  const updateAuthState = useCallback((session: Session | null) => {
    console.log("Atualizando estado de autenticação:", session ? "Autenticado" : "Não autenticado");
    const user = session?.user || null;
    
    setSessionState({
      isAuthenticated: !!session,
      user: user,
      session: session,
      isLoading: false,
    });

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      console.log("Usuário autenticado, verificando status de assinatura para:", user.email);
      // Usar setTimeout para evitar deadlocks na API do Supabase
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
      }, 0);
    }
  }, [queryClient]);
  
  useEffect(() => {
    let isMounted = true;
    
    console.log("Inicializando hook useSessionInit");
    
    // Set up authentication listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);

        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso."
          });
          
          // Clear cache on logout
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
          queryClient.clear();
        } else if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado",
            description: "Você foi autenticado com sucesso."
          });
        }

        if (isMounted) {
          updateAuthState(session);
        }
      }
    );

    // Check for existing session with timeout
    const checkExistingSession = async () => {
      try {
        console.log("Verificando sessão existente...");
        
        // Set max time for session verification (5 seconds)
        const timeoutPromise = new Promise<{data: {session: null}, error: Error}>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout ao verificar sessão")), 5000);
        });
        
        // Race between timeout and session check
        const { data, error } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        
        if (error) {
          console.error("Erro ao obter sessão:", error);
          throw error;
        }
        
        // Additional validation for session
        if (data.session && data.session.user) {
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError || !userData.user) {
              console.log("Sessão inválida detectada, realizando logout");
              await supabase.auth.signOut();
              if (isMounted) updateAuthState(null);
              return;
            }
            
            console.log("Email do usuário logado:", userData.user.email);
          } catch (userCheckError) {
            console.error("Erro ao verificar usuário:", userCheckError);
            if (isMounted) updateAuthState(null);
            return;
          }
        }
        
        if (isMounted) {
          updateAuthState(data.session);
          console.log("Status de autenticação após verificação:", data.session ? "Autenticado" : "Não autenticado");
        }
      } catch (error) {
        console.error("Erro de autenticação ou timeout:", error);
        if (isMounted) {
          setSessionState({
            isAuthenticated: false,
            user: null,
            session: null,
            isLoading: false,
          });
        }
      }
    };

    checkExistingSession();

    // Cleanup subscription
    return () => {
      console.log("Desmontando hook useSessionInit");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast, queryClient, updateAuthState]);

  return sessionState;
};
