
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
  
  // Determinar status premium de maneira segura
  const isPremiumUser = query.data?.isPremium || false;
  
  // Determinar dados extras de assinatura
  const subscriptionData = {
    role: query.data?.role || 'user',
    subscriptionStart: query.data?.subscriptionStart,
    subscriptionEnd: query.data?.subscriptionEnd,
    email: query.data?.email
  };

  /**
   * Invalida o cache de assinatura para forçar uma atualização
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
   */
  const refetchSubscription = useCallback(async () => {
    if (refetchInProgressRef.current) {
      return;
    }
    
    refetchInProgressRef.current = true;
    console.log("Atualizando dados de assinatura... (executando uma única vez)");
    
    try {
      return await query.refetch();
    } finally {
      // Garantir que o sinalizador seja redefinido mesmo em caso de erro
      setTimeout(() => {
        refetchInProgressRef.current = false;
      }, 5000); // Impedir novas tentativas por 5 segundos
    }
  }, [query]);

  return {
    ...query,
    isPremiumUser,
    subscriptionData,
    invalidateSubscriptionCache,
    refetchSubscription,
  };
};
