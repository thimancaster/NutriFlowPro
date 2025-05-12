
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
const CACHE_TTL = 60000; // 1 minute cache lifetime

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

    // Usar a função SQL segura para verificar status premium
    const { data, error } = await supabase.rpc('check_user_premium_status', {
      user_id: userId
    });

    if (error) {
      console.error("Erro ao verificar status premium:", error);
      // Cache the negative result temporarily to avoid repeated failures
      premiumStatusCache.set(cacheKey, { status: false, timestamp: Date.now() });
      
      // Fallback para verificação por email
      const emailResult = !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
      return emailResult;
    }

    const result = !!data;
    // Cache the result
    premiumStatusCache.set(cacheKey, { status: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error("Erro ao validar status premium:", err);
    // Cache the error state temporarily
    premiumStatusCache.set(cacheKey, { status: false, timestamp: Date.now() });
    
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
