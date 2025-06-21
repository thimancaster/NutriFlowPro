
/**
 * Strict validation hook
 * Phase 2: Enhanced type safety and validation
 */

import { useState, useCallback } from 'react';
import { StrictValidationResult } from '@/types/strict';
import { validateSecureForm } from '@/utils/securityValidation';

export function useStrictValidation<T = unknown>() {
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    lastResult: StrictValidationResult<T> | null;
  }>({
    isValidating: false,
    lastResult: null
  });

  const validateData = useCallback(async (
    data: unknown,
    validationType: 'patient' | 'calculation' | 'mealPlan'
  ): Promise<StrictValidationResult<T>> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      let result: StrictValidationResult<T>;

      switch (validationType) {
        case 'patient':
          result = validateSecureForm.patient(data) as StrictValidationResult<T>;
          break;
        case 'calculation':
          result = validateSecureForm.calculation(data) as StrictValidationResult<T>;
          break;
        case 'mealPlan':
          result = validateSecureForm.mealPlan(data) as StrictValidationResult<T>;
          break;
        default:
          result = {
            isValid: false,
            errors: { general: 'Tipo de validação não suportado' }
          };
      }

      setValidationState({
        isValidating: false,
        lastResult: result
      });

      return result;
    } catch (error) {
      const errorResult: StrictValidationResult<T> = {
        isValid: false,
        errors: { 
          validation: error instanceof Error ? error.message : 'Erro de validação desconhecido' 
        }
      };

      setValidationState({
        isValidating: false,
        lastResult: errorResult
      });

      return errorResult;
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      lastResult: null
    });
  }, []);

  return {
    validateData,
    clearValidation,
    isValidating: validationState.isValidating,
    lastResult: validationState.lastResult
  };
}
