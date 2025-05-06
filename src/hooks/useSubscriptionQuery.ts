
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
import { useToast } from "./use-toast";
import { validatePremiumStatus } from "@/utils/subscriptionUtils";
import { User } from "@supabase/supabase-js";
import React from "react";

export interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// Optimized refetch settings to prevent excessive API calls
const OPTIMIZED_REFETCH_SETTINGS = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: true,
  retry: 1,
  retryDelay: 5000 // 5 seconds
};

/**
 * Hook para buscar dados de assinatura do banco de dados de forma otimizada e segura
 */
export const useSubscriptionQuery = (user: User | null, isAuthenticated: boolean | null) => {
  const { toast } = useToast();
  
  // Track if we've already shown an error toast to prevent spam
  const errorToastShown = React.useRef(false);
  
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEY, user?.id],
    queryFn: async (): Promise<SubscriptionData> => {
      try {
        // Não buscar se o usuário não estiver autenticado
        if (!isAuthenticated || !user) {
          return {
            isPremium: false,
            role: 'user',
            email: null
          };
        }

        // Verificar status premium usando a função segura do banco
        const isPremium = await validatePremiumStatus(user.id, user.email);
        
        // Se o usuário for premium pelo e-mail, retornar dados simplificados
        if (isPremium && validatePremiumStatus(undefined, user.email)) {
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null // Sem data de expiração para e-mails premium
          };
        }

        // Buscar o papel do usuário usando função segura
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
          user_id: user.id
        });
        
        if (roleError) {
          console.warn("Erro ao buscar papel do usuário:", roleError);
        }
        
        // Buscar dados completos da assinatura
        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email, subscription_start, subscription_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error && error.message && !error.message.includes('infinite recursion')) {
          console.error("Erro ao buscar dados da assinatura:", error);
          
          if (!errorToastShown.current) {
            toast({
              title: "Erro ao buscar dados da assinatura",
              description: "Estamos com dificuldades técnicas. Tentando modo offline.",
              variant: "destructive",
            });
            errorToastShown.current = true;
          }
        }

        return {
          isPremium: isPremium,
          role: roleData || (data ? data.role : 'user'),
          email: data ? data.email : user.email,
          subscriptionStart: data ? data.subscription_start : null,
          subscriptionEnd: data ? data.subscription_end : null
        };
      } catch (error: any) {
        console.error("Erro na consulta de assinatura:", error);
        
        // Verificação de fallback: em caso de erro, ainda verificamos o e-mail
        const isPremium = await validatePremiumStatus(undefined, user?.email);
        
        return {
          isPremium,
          role: 'user',
          email: user?.email || null
        };
      }
    },
    enabled: !!isAuthenticated,
    ...OPTIMIZED_REFETCH_SETTINGS
  });
};
