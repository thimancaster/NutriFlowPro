
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

// Memory cache to prevent excessive API calls during the same session
const memoryCache = new Map<string, {data: SubscriptionData, timestamp: number}>();

// Optimized refetch settings to prevent excessive API calls
const OPTIMIZED_REFETCH_SETTINGS = {
  staleTime: 5 * 60 * 1000, // 5 minutes stale time
  cacheTime: 30 * 60 * 1000, // 30 minutes cache time
  refetchOnWindowFocus: false, // Disabled to avoid calls on focus
  refetchOnMount: true,
  refetchOnReconnect: false, // Disabled to avoid calls on reconnection
  retry: 1, // Reduced to minimize excessive calls on failure
  retryDelay: 5000 // 5 seconds between retries
};

/**
 * Hook para buscar dados de assinatura do banco de dados de forma otimizada e segura
 */
export const useSubscriptionQuery = (user: User | null, isAuthenticated: boolean | null) => {
  const { toast } = useToast();
  
  // Track if we've already shown an error toast to prevent spam
  const errorToastShown = React.useRef(false);
  // Track if the query is currently running to prevent duplicates
  const isQueryRunningRef = React.useRef(false);

  // Force the same query key for all users unless logged in with specific ID
  const queryKey = user?.id ? [SUBSCRIPTION_QUERY_KEY, user.id] : [SUBSCRIPTION_QUERY_KEY, 'anonymous'];
  const cacheKey = user?.id || 'anonymous';
  
  return useQuery({
    queryKey: queryKey,
    queryFn: async (): Promise<SubscriptionData> => {
      try {
        // Check if query is already running to prevent duplicate calls
        if (isQueryRunningRef.current) {
          console.log("Query already running, using cached or default data");
          
          // Return cache if available
          const cachedData = memoryCache.get(cacheKey);
          if (cachedData && (Date.now() - cachedData.timestamp) < 60000) { // 1 minute cache
            console.log("Using memory cache for subscription data");
            return cachedData.data;
          }
          
          // Return default data if not authenticated
          return {
            isPremium: false,
            role: 'user',
            email: user?.email || null
          };
        }
        
        isQueryRunningRef.current = true;
        
        try {
          // Não buscar se o usuário não estiver autenticado
          if (!isAuthenticated || !user) {
            return {
              isPremium: false,
              role: 'user',
              email: null
            };
          }
  
          // Use memory cache if available and recent
          const cachedData = memoryCache.get(cacheKey);
          if (cachedData && (Date.now() - cachedData.timestamp) < 60000) { // 1 minute cache
            console.log("Using memory cache for subscription data");
            return cachedData.data;
          }
  
          // Verificar emails premium direto (rápido fail-fast)
          if (user.email && PREMIUM_EMAILS.includes(user.email)) {
            const result = {
              isPremium: true,
              role: 'premium',
              email: user.email,
              subscriptionStart: new Date().toISOString(),
              subscriptionEnd: null // Sem data de expiração para e-mails premium
            };
            
            // Update memory cache
            memoryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            
            return result;
          }
  
          // Verificar status premium usando a função segura do banco
          try {
            const isPremium = await validatePremiumStatus(user.id, user.email);
            
            // Em vez de consultar o banco de dados toda vez, armazenamos o valor em cache
            const roleData = isPremium ? 'premium' : 'user';
            
            // Retornar dados em cache primeiro se disponível
            const cachedSubData = localStorage.getItem(`subscription_${user.id}`);
            if (cachedSubData) {
              const parsed = JSON.parse(cachedSubData);
              // Apenas use o cache se o status premium for o mesmo
              if (parsed.isPremium === isPremium) {
                const result = {
                  isPremium,
                  role: roleData,
                  email: user.email,
                  subscriptionStart: parsed.subscriptionStart,
                  subscriptionEnd: parsed.subscriptionEnd
                };
                
                // Update memory cache
                memoryCache.set(cacheKey, {
                  data: result,
                  timestamp: Date.now()
                });
                
                return result;
              }
            }
            
            // Se não tiver cache ou cache inválido, consulta o banco
            const { data, error } = await supabase
              .from("subscribers")
              .select("is_premium, role, email, subscription_start, subscription_end")
              .eq("user_id", user.id)
              .maybeSingle();
  
            if (error) {
              console.warn("Erro ao buscar dados da assinatura:", error);
              
              // Apenas mostra toast uma vez
              if (!errorToastShown.current) {
                toast({
                  title: "Erro ao buscar dados da assinatura",
                  description: "Usando configurações padrão.",
                  variant: "destructive",
                });
                errorToastShown.current = true;
                
                // Reset após 5 minutos
                setTimeout(() => {
                  errorToastShown.current = false;
                }, 300000);
              }
              
              // Retorna dados baseados no status premium já verificado
              const result = {
                isPremium,
                role: roleData,
                email: user.email
              };
              
              // Update memory cache
              memoryCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              return result;
            }
  
            const result = {
              isPremium,
              role: roleData,
              email: data ? data.email : user.email,
              subscriptionStart: data ? data.subscription_start : null,
              subscriptionEnd: data ? data.subscription_end : null
            };
            
            // Salva no cache
            localStorage.setItem(`subscription_${user.id}`, JSON.stringify(result));
            
            // Update memory cache
            memoryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            
            return result;
          } catch (e) {
            console.error("Erro na validação premium:", e);
            
            // Verificação de fallback direta para emails premium
            const isPremium = user.email ? PREMIUM_EMAILS.includes(user.email) : false;
            
            const result = {
              isPremium,
              role: isPremium ? 'premium' : 'user',
              email: user.email
            };
            
            // Update memory cache
            memoryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            
            return result;
          }
        } finally {
          isQueryRunningRef.current = false;
        }
      } catch (error: any) {
        console.error("Erro na consulta de assinatura:", error);
        isQueryRunningRef.current = false;
        
        // Verificação de fallback: em caso de erro, ainda verificamos o e-mail
        const isPremium = user?.email ? PREMIUM_EMAILS.includes(user.email) : false;
        
        const result = {
          isPremium,
          role: 'user',
          email: user?.email || null
        };
        
        // Update memory cache
        memoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      }
    },
    enabled: !!isAuthenticated,
    ...OPTIMIZED_REFETCH_SETTINGS
  });
};
