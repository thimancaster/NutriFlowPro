
import { useState } from 'react';
import { secureApiClient } from '@/utils/security/secureApiClient';
import { validatePatientData, validateCalculationData } from '@/utils/security/inputValidation';
import { useSecurityContext } from '@/components/security/SecurityProvider';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for secure operations with enhanced validation and security checks
 */
export const useSecureOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSecure, validateSecurity } = useSecurityContext();
  const { toast } = useToast();

  const secureCreatePatient = async (patientData: any) => {
    if (!isSecure) {
      await validateSecurity();
      if (!isSecure) {
        throw new Error('Operação bloqueada por motivos de segurança');
      }
    }

    setIsLoading(true);
    try {
      // Validate input data
      const validation = validatePatientData(patientData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await secureApiClient.createPatient(patientData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: 'Sucesso',
        description: 'Paciente criado com sucesso'
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const secureCreateCalculation = async (calculationData: any) => {
    if (!isSecure) {
      await validateSecurity();
      if (!isSecure) {
        throw new Error('Operação bloqueada por motivos de segurança');
      }
    }

    setIsLoading(true);
    try {
      // Validate input data
      const validation = validateCalculationData(calculationData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await secureApiClient.createCalculation(calculationData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: 'Sucesso',
        description: 'Cálculo salvo com sucesso'
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const secureCreateMealPlan = async (mealPlanData: any) => {
    if (!isSecure) {
      await validateSecurity();
      if (!isSecure) {
        throw new Error('Operação bloqueada por motivos de segurança');
      }
    }

    setIsLoading(true);
    try {
      const result = await secureApiClient.createMealPlan(mealPlanData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: 'Sucesso',
        description: 'Plano alimentar criado com sucesso'
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const secureSearchFoods = async (query: string, category?: string, limit = 20) => {
    if (!query || query.length < 2) {
      throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
    }

    setIsLoading(true);
    try {
      const result = await secureApiClient.searchFoods(query, category, limit);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error: any) {
      toast({
        title: 'Erro na Busca',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePremiumAccess = async (feature: string, action = 'read') => {
    try {
      return await secureApiClient.validatePremiumAccess(feature, action);
    } catch (error: any) {
      toast({
        title: 'Erro de Validação',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    isLoading,
    secureCreatePatient,
    secureCreateCalculation,
    secureCreateMealPlan,
    secureSearchFoods,
    validatePremiumAccess
  };
};
