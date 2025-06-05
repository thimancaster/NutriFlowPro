
import { supabase } from '@/integrations/supabase/client';

export interface QuotaCheckResult {
  canAccess: boolean;
  isPremium: boolean;
  currentUsage: number;
  limit: number | string;
  reason?: string;
}

/**
 * Server-side premium quota validation using the database function
 */
export const checkPremiumQuota = async (
  userId: string,
  feature: 'patients' | 'meal_plans' | 'calculations',
  action: 'create' | 'view' = 'create'
): Promise<QuotaCheckResult> => {
  try {
    const { data, error } = await supabase.rpc('check_premium_quota', {
      p_user_id: userId,
      p_feature: feature,
      p_action: action
    });

    if (error) {
      console.error('Error checking premium quota:', error);
      // Fallback to allowing access on error to avoid blocking users
      return {
        canAccess: true,
        isPremium: false,
        currentUsage: 0,
        limit: 'unknown',
        reason: 'Erro ao verificar limite'
      };
    }

    return data as QuotaCheckResult;
  } catch (error) {
    console.error('Quota check failed:', error);
    return {
      canAccess: true,
      isPremium: false,
      currentUsage: 0,
      limit: 'unknown',
      reason: 'Erro ao verificar limite'
    };
  }
};

/**
 * React hook for quota validation
 */
export const useQuotaValidation = () => {
  const validateQuota = async (
    userId: string,
    feature: 'patients' | 'meal_plans' | 'calculations',
    action: 'create' | 'view' = 'create'
  ): Promise<QuotaCheckResult> => {
    return await checkPremiumQuota(userId, feature, action);
  };

  return { validateQuota };
};
