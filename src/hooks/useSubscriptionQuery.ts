import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_QUERY_KEY, SUBSCRIPTION_REFETCH_SETTINGS } from "@/constants/subscriptionConstants";
import { useToast } from "./use-toast";
import { validatePremiumStatus, isSubscriptionExpired } from "@/utils/subscriptionUtils";
import { User } from "@supabase/supabase-js";
import React from "react";

export interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

/**
 * Hook para buscar dados de assinatura do banco de dados de forma otimizada
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

        // VERIFICAÇÃO PRIORITÁRIA: verificar se o e-mail está na lista premium
        // Esta verificação tem prioridade absoluta sobre qualquer dado do banco
        if (validatePremiumStatus(user.email, null)) {
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null // Sem data de expiração para e-mails premium
          };
        }

        // Buscar dados do banco com cache otimizado
        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email, subscription_start, subscription_end")
          .eq("user_id", user.id)
          .maybeSingle();

        // Handle specific recursive policy error silently
        if (error && error.message && error.message.includes('infinite recursion')) {
          console.warn("Recurssion policy error in subscribers table:", error.message);
          
          // Use email check as fallback without triggering toast
          if (validatePremiumStatus(user.email, null)) {
            return {
              isPremium: true,
              role: 'premium',
              email: user.email,
              subscriptionStart: new Date().toISOString(),
              subscriptionEnd: null
            };
          }
          
          // Return default values if not premium by email
          return {
            isPremium: false,
            role: 'user',
            email: user.email
          };
        }

        // For other errors, only show toast once
        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar dados da assinatura:", error);
          
          // Only show the toast notification once per session
          if (!errorToastShown.current) {
            toast({
              title: "Erro ao buscar dados da assinatura",
              description: "Estamos com dificuldades técnicas. Tentando modo offline.",
              variant: "destructive",
            });
            errorToastShown.current = true;
          }
          
          // Verificação de segurança: se ocorrer um erro, mas o e-mail é premium, retornar premium
          if (validatePremiumStatus(user.email, null)) {
            return {
              isPremium: true,
              role: 'premium',
              email: user.email,
              subscriptionStart: new Date().toISOString(),
              subscriptionEnd: null
            };
          }
          
          throw error;
        }

        // Verificar se a assinatura expirou
        const expired = isSubscriptionExpired(data?.subscription_end);
        
        return {
          isPremium: data ? (!!data.is_premium && !expired) : false,
          role: data ? data.role : 'user',
          email: data ? data.email : user.email,
          subscriptionStart: data ? data.subscription_start : null,
          subscriptionEnd: data ? data.subscription_end : null
        };
      } catch (error: any) {
        // Verificação de fallback: em caso de erro, se o e-mail é premium, retornar premium
        if (validatePremiumStatus(user.email, null)) {
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null
          };
        }
        
        return {
          isPremium: false,
          role: 'user',
          email: user?.email || null
        };
      }
    },
    enabled: !!isAuthenticated,
    ...SUBSCRIPTION_REFETCH_SETTINGS,
    // Reduce retry attempts to minimize errors
    retry: 1,
    // Add a longer stale time to reduce excessive retries
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
