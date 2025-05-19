
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "./useAuthState";
import { useSubscriptionQuery } from "./useSubscriptionQuery";
import { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
import { useCallback, useRef } from "react";

export { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
export type { SubscriptionData } from "./useSubscriptionQuery";

/**
 * Hook para gerenciar o status da assinatura do usuário com funcionalidade estendida e otimizada
 */
export const useUserSubscription = () => {
  const { user, isAuthenticated } = useAuthState();
  const queryClient = useQueryClient();
  const refetchInProgressRef = useRef(false);
  
  // Usar o hook de consulta de assinatura principal com configurações otimizadas
  const query = useSubscriptionQuery(user, isAuthenticated);
  
  // Determinar status premium de maneira segura com fallback
  const isPremiumUser = query.data?.isPremium || false;
  
  // Determinar dados extras de assinatura
  const subscriptionData = {
    role: query.data?.role || 'user',
    subscriptionStart: query.data?.subscriptionStart,
    subscriptionEnd: query.data?.subscriptionEnd,
    email: query.data?.email
  };

  /**
   * Invalidida o cache de assinatura para forçar uma atualização
   * Com debounce interno para evitar múltiplas chamadas
   */
  const invalidateSubscriptionCache = useCallback(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
    } else {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
    }
  }, [queryClient, user?.id]);

  /**
   * Força uma atualização dos dados de assinatura com controle para evitar múltiplas chamadas
   * e com retry em caso de falha
   */
  const refetchSubscription = useCallback(async () => {
    if (refetchInProgressRef.current) {
      console.log("Já existe um refetch em andamento, pulando...");
      return;
    }
    
    refetchInProgressRef.current = true;
    console.log("Atualizando dados de assinatura...");
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await query.refetch();
        refetchInProgressRef.current = false;
        return result;
      } catch (error) {
        attempts++;
        console.error(`Erro ao atualizar dados (tentativa ${attempts}/${maxAttempts}):`, error);
        
        if (attempts >= maxAttempts) {
          refetchInProgressRef.current = false;
          throw error;
        }
        
        // Esperar antes de tentar novamente (com backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
    
    // Garantir que o sinalizador seja redefinido mesmo em caso de erro
    refetchInProgressRef.current = false;
  }, [query]);

  return {
    ...query,
    isPremiumUser,
    subscriptionData,
    invalidateSubscriptionCache,
    refetchSubscription,
  };
};
