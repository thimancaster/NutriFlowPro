
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { validatePremiumAccess, logPremiumAccessAttempt } from '@/utils/premium/premiumSecurityUtils';
import type { PremiumValidationResult } from '@/utils/premium/premiumSecurityUtils';

/**
 * Hook for secure premium feature validation
 */
export const usePremiumSecurity = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useAuth();

  /**
   * Validate access to a premium feature with backend verification
   */
  const validateFeatureAccess = useCallback(async (
    feature: 'patients' | 'meal_plans' | 'calculations',
    action: 'create' | 'read' | 'update' | 'delete' = 'read'
  ): Promise<PremiumValidationResult> => {
    if (!user?.id) {
      return {
        isPremium: false,
        quotas: {
          patients: { current: 0, limit: 0 },
          mealPlans: { current: 0, limit: 0 },
          calculations: { current: 0, limit: 0 }
        },
        canAccess: false,
        reason: 'User not authenticated'
      };
    }

    setIsValidating(true);
    
    try {
      const result = await validatePremiumAccess(user.id, feature, action);
      
      // Log the access attempt
      await logPremiumAccessAttempt(
        user.id,
        feature,
        action,
        result.canAccess,
        result.reason
      );

      return result;
    } catch (error) {
      console.error('Error validating feature access:', error);
      
      // Log the error
      await logPremiumAccessAttempt(
        user.id,
        feature,
        action,
        false,
        'Validation error'
      );

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
    } finally {
      setIsValidating(false);
    }
  }, [user?.id]);

  /**
   * Check if user can create a new item of specified type
   */
  const canCreateNew = useCallback(async (
    feature: 'patients' | 'meal_plans' | 'calculations'
  ): Promise<boolean> => {
    const result = await validateFeatureAccess(feature, 'create');
    return result.canAccess;
  }, [validateFeatureAccess]);

  /**
   * Get usage quotas for display
   */
  const getUsageQuotas = useCallback(async () => {
    if (!user?.id) return null;
    
    const result = await validateFeatureAccess('patients', 'read');
    return result.quotas;
  }, [user?.id, validateFeatureAccess]);

  return {
    validateFeatureAccess,
    canCreateNew,
    getUsageQuotas,
    isValidating
  };
};
