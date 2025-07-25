
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
 * Validate premium access with backend verification
 */
export const validatePremiumAccess = async (
  userId: string,
  feature: 'patients' | 'meal_plans' | 'calculations',
  action: 'create' | 'read' | 'update' | 'delete' = 'read'
): Promise<PremiumValidationResult> => {
  try {
    const { data, error } = await supabase.rpc('validate_premium_access_secure', {
      feature_name: feature,
      action_type: action
    });

    if (error) {
      console.error('Error validating premium access:', error);
      return {
        isPremium: false,
        quotas: {
          patients: { current: 0, limit: 0 },
          mealPlans: { current: 0, limit: 0 },
          calculations: { current: 0, limit: 0 }
        },
        canAccess: false,
        reason: 'Validation error'
      };
    }

    const result = data as any;
    
    return {
      isPremium: result.is_premium || false,
      quotas: {
        patients: { 
          current: result.current_usage || 0, 
          limit: result.is_premium ? Infinity : (result.limit || 5)
        },
        mealPlans: { 
          current: result.current_usage || 0, 
          limit: result.is_premium ? Infinity : (result.limit || 3)
        },
        calculations: { 
          current: result.current_usage || 0, 
          limit: result.is_premium ? Infinity : (result.limit || 10)
        }
      },
      canAccess: result.has_access || false,
      reason: result.reason
    };
  } catch (error) {
    console.error('Error validating premium access:', error);
    return {
      isPremium: false,
      quotas: {
        patients: { current: 0, limit: 0 },
        mealPlans: { current: 0, limit: 0 },
        calculations: { current: 0, limit: 0 }
      },
      canAccess: false,
      reason: 'Network error'
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
  granted: boolean,
  reason?: string
): Promise<void> => {
  try {
    await auditLogService.logEvent({
      user_id: userId,
      event_type: 'premium_access_attempt',
      event_data: {
        feature,
        action,
        granted,
        reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error logging premium access attempt:', error);
  }
};
