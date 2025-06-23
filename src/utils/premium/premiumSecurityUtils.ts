
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';

export interface PremiumValidationResult {
  isPremium: boolean;
  quotas: {
    patients: { current: number; limit: number };
    mealPlans: { current: number; limit: number };
    calculations: { current: number; limit: number };
  };
  canAccess: boolean;
  reason?: string;
}

/**
 * Validate premium access using secure backend function
 */
export const validatePremiumAccess = async (
  userId: string,
  feature: 'patients' | 'meal_plans' | 'calculations',
  action: 'create' | 'read' | 'update' | 'delete' = 'read'
): Promise<PremiumValidationResult> => {
  try {
    // Use the secure RPC function
    const { data, error } = await supabase.rpc('check_premium_access_secure', {
      feature_name: feature
    });

    if (error) {
      console.error('Premium validation error:', error);
      return {
        isPremium: false,
        quotas: {
          patients: { current: 0, limit: 5 },
          mealPlans: { current: 0, limit: 3 },
          calculations: { current: 0, limit: 10 }
        },
        canAccess: false,
        reason: 'Validation error'
      };
    }

    // Type guard for the response data
    const hasAccess = data && typeof data === 'object' && 'has_access' in data 
      ? Boolean(data.has_access) 
      : false;

    // Get current usage quotas
    const quotas = await getCurrentUsageQuotas(userId, hasAccess);

    return {
      isPremium: hasAccess,
      quotas,
      canAccess: hasAccess || (action !== 'create'),
      reason: hasAccess ? undefined : 'Premium subscription required'
    };
  } catch (error) {
    console.error('Premium access validation failed:', error);
    return {
      isPremium: false,
      quotas: {
        patients: { current: 0, limit: 5 },
        mealPlans: { current: 0, limit: 3 },
        calculations: { current: 0, limit: 10 }
      },
      canAccess: false,
      reason: 'System error'
    };
  }
};

/**
 * Get current usage quotas for a user
 */
const getCurrentUsageQuotas = async (userId: string, isPremium: boolean) => {
  try {
    // Get patient count
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get meal plan count
    const { count: mealPlanCount } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get calculation count
    const { count: calculationCount } = await supabase
      .from('calculations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      patients: {
        current: patientCount || 0,
        limit: isPremium ? Infinity : 5
      },
      mealPlans: {
        current: mealPlanCount || 0,
        limit: isPremium ? Infinity : 3
      },
      calculations: {
        current: calculationCount || 0,
        limit: isPremium ? Infinity : 10
      }
    };
  } catch (error) {
    console.error('Error getting usage quotas:', error);
    return {
      patients: { current: 0, limit: isPremium ? Infinity : 5 },
      mealPlans: { current: 0, limit: isPremium ? Infinity : 3 },
      calculations: { current: 0, limit: isPremium ? Infinity : 10 }
    };
  }
};

/**
 * Log premium access attempt
 */
export const logPremiumAccessAttempt = async (
  userId: string,
  feature: string,
  action: string,
  allowed: boolean,
  reason?: string
) => {
  await auditLogService.logPremiumAccess(userId, feature, action, allowed, reason);
};
