
import { supabase } from "@/integrations/supabase/client";

/**
 * Security utilities for premium features
 */

export interface UserQuotas {
  patients: { current: number; limit: number };
  mealPlans: { current: number; limit: number };
  calculations: { current: number; limit: number };
}

export interface PremiumValidationResult {
  isPremium: boolean;
  quotas: UserQuotas;
  canAccess: boolean;
  reason?: string;
}

/**
 * Validate premium access with quota checks
 */
export const validatePremiumAccess = async (
  userId: string,
  feature: 'patients' | 'meal_plans' | 'calculations',
  action: 'create' | 'read' | 'update' | 'delete' = 'read'
): Promise<PremiumValidationResult> => {
  try {
    // Check premium status using the existing RPC
    const { data: isPremium, error: premiumError } = await supabase
      .rpc('check_user_premium_status', { user_id: userId });

    if (premiumError) {
      console.error('Error checking premium status:', premiumError);
      return {
        isPremium: false,
        quotas: getDefaultQuotas(),
        canAccess: false,
        reason: 'Error checking premium status'
      };
    }

    // Get current usage counts
    const quotas = await getCurrentQuotas(userId);

    // If user is premium, they have unlimited access
    if (isPremium) {
      return {
        isPremium: true,
        quotas: {
          ...quotas,
          patients: { ...quotas.patients, limit: Infinity },
          mealPlans: { ...quotas.mealPlans, limit: Infinity },
          calculations: { ...quotas.calculations, limit: Infinity }
        },
        canAccess: true
      };
    }

    // For free users, check quotas
    const canAccess = checkFreeUserQuota(quotas, feature, action);
    
    return {
      isPremium: false,
      quotas,
      canAccess,
      reason: canAccess ? undefined : `Free tier limit reached for ${feature}`
    };

  } catch (error) {
    console.error('Error in validatePremiumAccess:', error);
    return {
      isPremium: false,
      quotas: getDefaultQuotas(),
      canAccess: false,
      reason: 'Validation error'
    };
  }
};

/**
 * Get current usage quotas for a user
 */
async function getCurrentQuotas(userId: string): Promise<UserQuotas> {
  try {
    // Get patients count
    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get meal plans count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: mealPlansCount } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get calculations count (last 30 days)
    const { count: calculationsCount } = await supabase
      .from('calculation_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('calculation_date', thirtyDaysAgo.toISOString());

    return {
      patients: { current: patientsCount || 0, limit: 5 },
      mealPlans: { current: mealPlansCount || 0, limit: 10 },
      calculations: { current: calculationsCount || 0, limit: 20 }
    };
  } catch (error) {
    console.error('Error getting quotas:', error);
    return getDefaultQuotas();
  }
}

/**
 * Check if free user can perform action based on quotas
 */
function checkFreeUserQuota(
  quotas: UserQuotas,
  feature: 'patients' | 'meal_plans' | 'calculations',
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  // Read operations are always allowed
  if (action === 'read') return true;
  
  // Update and delete on existing items are allowed
  if (action === 'update' || action === 'delete') return true;

  // For create operations, check quotas
  switch (feature) {
    case 'patients':
      return quotas.patients.current < quotas.patients.limit;
    case 'meal_plans':
      return quotas.mealPlans.current < quotas.mealPlans.limit;
    case 'calculations':
      return quotas.calculations.current < quotas.calculations.limit;
    default:
      return false;
  }
}

/**
 * Get default quotas (fallback)
 */
function getDefaultQuotas(): UserQuotas {
  return {
    patients: { current: 0, limit: 5 },
    mealPlans: { current: 0, limit: 10 },
    calculations: { current: 0, limit: 20 }
  };
}

/**
 * Log security event for premium access attempt
 */
export const logPremiumAccessAttempt = async (
  userId: string,
  feature: string,
  action: string,
  allowed: boolean,
  reason?: string
) => {
  try {
    // Use existing audit service
    const { auditLogService } = await import('@/services/auditLogService');
    
    await auditLogService.logEvent({
      user_id: userId,
      event_type: allowed ? 'premium_access_granted' : 'premium_access_denied',
      event_data: {
        feature,
        action,
        reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error logging premium access attempt:', error);
  }
};
