
import { FREE_TIER_LIMITS } from "@/constants/subscriptionConstants";
import { useUserSubscription } from "./useUserSubscription";
import { useAuthState } from "./useAuthState";
import { useMemo } from "react";

/**
 * Hook para gerenciar acesso às funcionalidades baseado no plano do usuário
 */
export const useFeatureAccess = () => {
  const { isPremiumUser, data: subscriptionData } = useUserSubscription();
  const { isPremium: authPremium, user } = useAuthState();
  
  // Check if user is a developer (special privilege)
  const isDeveloper = useMemo(() => {
    // Check if user has developer role from subscription data
    const hasDeveloperRole = subscriptionData?.role === 'developer';
    
    // Check if user's email is in the developer list (from subscriptionData or user object)
    const email = subscriptionData?.email || user?.email;
    const isDeveloperEmail = email === 'thimancaster@hotmail.com';
    
    return hasDeveloperRole || isDeveloperEmail;
  }, [subscriptionData?.role, subscriptionData?.email, user?.email]);
  
  // Combine the different checks for premium status
  const isPremium = useMemo(() => {
    return isPremiumUser || authPremium || isDeveloper;
  }, [isPremiumUser, authPremium, isDeveloper]);

  // Determine the tier based on role and premium status
  const userTier = useMemo(() => {
    if (isDeveloper) return 'developer';
    return isPremium ? 'premium' : 'free'; 
  }, [isPremium, isDeveloper]);

  /**
   * Retorna a quota de pacientes com base no plano
   */
  const getPatientsQuota = () => {
    if (isPremium || isDeveloper) {
      return { limit: Infinity, used: 0 };
    }
    return { limit: FREE_TIER_LIMITS.patients, used: 0 };
  };

  /**
   * Retorna a quota de planos alimentares com base no plano
   */
  const getMealPlansQuota = () => {
    if (isPremium || isDeveloper) {
      return { limit: Infinity, used: 0 };
    }
    return { limit: FREE_TIER_LIMITS.mealPlans, used: 0 };
  };

  /**
   * Retorna a quota de consultas com base no plano
   */
  const getConsultationsQuota = () => {
    if (isPremium || isDeveloper) {
      return { limit: Infinity, used: 0 };
    }
    return { limit: FREE_TIER_LIMITS.historyDays, used: 0 };
  };

  /**
   * Verifica se o usuário tem acesso a uma funcionalidade premium
   */
  const canAccessPremiumFeature = (feature: string) => {
    // Developers have access to everything
    if (isDeveloper) {
      return true;
    }
    
    // Premium users have access to premium features
    if (isPremium) {
      return true;
    }
    
    // Lista de recursos que são gratuitos mesmo na versão gratuita
    const freeFeatures = ['calculator', 'basic-patients'];
    
    return freeFeatures.includes(feature);
  };

  return {
    isPremiumUser: isPremium,
    isDeveloper,
    userTier,
    getPatientsQuota,
    getMealPlansQuota,
    getConsultationsQuota,
    canAccessPremiumFeature,
  };
};

export default useFeatureAccess;
