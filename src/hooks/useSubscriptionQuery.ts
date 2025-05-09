
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_QUERY_KEY, PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
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
  retry: 2, // Increased retries for better reliability
  retryDelay: 3000 // 3 seconds
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

        // Verificar emails premium direto (rápido fail-fast)
        if (user.email && PREMIUM_EMAILS.includes(user.email)) {
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null // Sem data de expiração para e-mails premium
          };
        }

        // Verificar status premium usando a função segura do banco
        try {
          const isPremium = await validatePremiumStatus(user.id, user.email);
          
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

          if (error) {
            console.error("Erro ao buscar dados da assinatura:", error);
            
            if (!errorToastShown.current) {
              toast({
                title: "Erro ao buscar dados da assinatura",
                description: "Estamos com dificuldades técnicas. Tentando modo offline.",
                variant: "destructive",
              });
              errorToastShown.current = true;
            }
            
            // Ainda retornamos dados básicos mesmo com erro
            return {
              isPremium: isPremium,
              role: roleData || 'user',
              email: user.email
            };
          }

          return {
            isPremium: isPremium,
            role: roleData || (data ? data.role : 'user'),
            email: data ? data.email : user.email,
            subscriptionStart: data ? data.subscription_start : null,
            subscriptionEnd: data ? data.subscription_end : null
          };
        } catch (e) {
          console.error("Erro na validação premium:", e);
          
          // Verificação de fallback direta para emails premium
          const isPremium = user.email ? PREMIUM_EMAILS.includes(user.email) : false;
          
          return {
            isPremium,
            role: isPremium ? 'premium' : 'user',
            email: user.email
          };
        }
      } catch (error: any) {
        console.error("Erro na consulta de assinatura:", error);
        
        // Verificação de fallback: em caso de erro, ainda verificamos o e-mail
        const isPremium = user?.email ? PREMIUM_EMAILS.includes(user.email) : false;
        
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
