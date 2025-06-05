
import { useState } from 'react';
import { validatePatientDataServer } from '@/utils/serverValidation';
import { checkPremiumQuota, QuotaCheckResult } from '@/utils/premiumQuotaValidation';
import { logSecurityEvent, SecurityEvents } from '@/utils/auditLogger';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useSecurityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useAuth();

  const validatePatientData = async (
    name: string,
    email?: string,
    phone?: string,
    cpf?: string
  ) => {
    setIsValidating(true);
    try {
      const result = await validatePatientDataServer(name, email, phone, cpf);
      
      if (user && !result.isValid) {
        await logSecurityEvent(user.id, {
          eventType: SecurityEvents.PATIENT_CREATED,
          eventData: { validationFailed: true, errors: result.errors }
        });
      }
      
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const checkQuota = async (
    feature: 'patients' | 'meal_plans' | 'calculations',
    action: 'create' | 'view' = 'create'
  ): Promise<QuotaCheckResult> => {
    if (!user) {
      return {
        canAccess: false,
        isPremium: false,
        currentUsage: 0,
        limit: 0,
        reason: 'Usuário não autenticado'
      };
    }

    const result = await checkPremiumQuota(user.id, feature, action);
    
    if (!result.canAccess) {
      await logSecurityEvent(user.id, {
        eventType: SecurityEvents.QUOTA_EXCEEDED,
        eventData: { feature, action, currentUsage: result.currentUsage, limit: result.limit }
      });
    }
    
    return result;
  };

  return {
    validatePatientData,
    checkQuota,
    isValidating
  };
};
