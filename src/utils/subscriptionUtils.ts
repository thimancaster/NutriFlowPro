
import { PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// In-memory cache to prevent redundant checks
const premiumStatusCache = new Map<string, {status: boolean, timestamp: number}>();
const CACHE_TTL = 300000; // 5 minute cache lifetime (increased from 1 minute)
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Retry mechanism for Supabase queries
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Valida se um usuário tem status premium com base no e-mail ou dados de assinatura
 * usando função segura do banco de dados com cache local para reduzir chamadas à API
 * @param userId ID do usuário
 * @returns Boolean indicando status premium
 */
export const validatePremiumStatus = async (
  userId: string | undefined,
  fallbackEmail: string | null | undefined
): Promise<boolean> => {
  // Early return for no user ID
  if (!userId) {
    console.log("Verificação premium: sem userId, verificando apenas email");
    // Fallback para verificação por email para compatibilidade
    return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
  }

  // Check cache first
  const cacheKey = userId;
  const cachedResult = premiumStatusCache.get(cacheKey);
  if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
    console.log("Usando valor em cache para status premium:", cachedResult.status);
    return cachedResult.status;
  }

  try {
    console.log("Verificando status premium para usuário:", userId);
    
    // Check email first for quick response (avoid DB call if possible)
    if (fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail)) {
      premiumStatusCache.set(cacheKey, { status: true, timestamp: Date.now() });
      return true;
    }

    // Circuit breaker - check if Supabase is available before making RPC call
    try {
      const healthCheck = await supabase.from('subscribers').select('count(*)', { count: 'exact', head: true });
      if (healthCheck.error) {
        console.error("Serviço Supabase com problemas, usando verificação de email:", healthCheck.error);
        const emailResult = !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
        premiumStatusCache.set(cacheKey, { status: emailResult, timestamp: Date.now() });
        return emailResult;
      }
    } catch (error) {
      console.error("Erro no health check do Supabase:", error);
      const emailResult = !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
      premiumStatusCache.set(cacheKey, { status: emailResult, timestamp: Date.now() });
      return emailResult;
    }

    // Use a retry wrapper for the RPC call
    const result = await withRetry(async () => {
      // Usar a função SQL segura para verificar status premium
      const { data, error } = await supabase.rpc('check_user_premium_status', {
        user_id: userId
      });

      if (error) {
        throw error;
      }

      return !!data;
    });
    
    // Cache the result
    premiumStatusCache.set(cacheKey, { status: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error("Erro ao validar status premium:", err);
    // Cache the error state temporarily with shorter expiry
    premiumStatusCache.set(cacheKey, { status: false, timestamp: Date.now() - CACHE_TTL/2 });
    
    // Fallback para verificação por email
    return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
  }
};

/**
 * Verifica se uma assinatura expirou
 * @param subscriptionEnd Data de término da assinatura como string ISO
 * @returns Boolean indicando se a assinatura expirou
 */
export const isSubscriptionExpired = (subscriptionEnd: string | null | undefined): boolean => {
  if (!subscriptionEnd) return false;
  return new Date() > new Date(subscriptionEnd);
};

/**
 * Formata a data de assinatura para exibição
 * @param dateString String ISO da data
 * @returns Data formatada ou texto padrão
 */
export const formatSubscriptionDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Não disponível';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return 'Data inválida';
  }
};
