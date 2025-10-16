
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
  
  // Developer privileges are now managed via user_roles table
  const isDeveloper = useMemo(() => {
    // Check if user has developer role from subscription data
    return subscriptionData?.role === 'developer';
  }, [subscriptionData?.role]);
  
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
