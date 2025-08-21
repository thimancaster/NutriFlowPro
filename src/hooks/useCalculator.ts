
/**
 * Hook Unificado para Cálculos Nutricionais
 * [UPDATED] Agora redireciona para o sistema consolidado
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  useConsolidatedNutrition,
  type ConsolidatedNutritionParams
} from './useConsolidatedNutrition';
import {
  mapActivityLevelToNew,
  mapActivityLevelToLegacy,
  mapObjectiveToNew,
  mapObjectiveToLegacy,
  mapProfileToNew,
  mapProfileToLegacy
} from '@/utils/nutrition/typeMapping';

// Legacy compatibility types
import type { 
  CalculationInputs as NewCalculationInputs,
  CompleteNutritionalResult
} from '@/utils/nutrition/centralMotor/enpCore';

export interface UseCalculatorReturn {
  formData: NewCalculationInputs;
  results: CompleteNutritionalResult | null;
  isCalculating: boolean;
  error: string | null;
  updateFormData: (data: Partial<NewCalculationInputs>) => void;
  calculate: (params?: NewCalculationInputs) => Promise<CompleteNutritionalResult | null>;
  reset: () => void;
  // Legacy compatibility properties
  hasActivePatient: boolean;
  activePatient: any;
  calculateWithParams?: (weight: number, height: number, age: number, gender: string, activityLevel: string, objective: string, profile: string) => Promise<CompleteNutritionalResult | null>;
}

const initialFormData: NewCalculationInputs = {
  weight: 0,
  height: 0, 
  age: 0,
  gender: 'F',
  profile: 'eutrofico',
  activityLevel: 'moderado', 
  objective: 'manutencao'
};

export const useCalculator = (): UseCalculatorReturn => {
  const [formData, setFormData] = useState<NewCalculationInputs>(initialFormData);
  const { toast } = useToast();
  
  // Use consolidated nutrition system
  const {
    results,
    isCalculating,
    error,
    calculateNutrition,
    clearResults
  } = useConsolidatedNutrition();

  const updateFormData = useCallback((data: Partial<NewCalculationInputs>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const calculate = useCallback(async (params?: NewCalculationInputs): Promise<CompleteNutritionalResult | null> => {
    const inputsToUse = params || formData;
    console.log('🧮 useCalculator: Delegando para sistema consolidado:', inputsToUse);
    
    // Convert to consolidated nutrition params
    const consolidatedParams: ConsolidatedNutritionParams = {
      weight: inputsToUse.weight,
      height: inputsToUse.height,
      age: inputsToUse.age,
      gender: inputsToUse.gender,
      activityLevel: inputsToUse.activityLevel,
      objective: inputsToUse.objective,
      profile: inputsToUse.profile
    };

    return await calculateNutrition(consolidatedParams);
  }, [formData, calculateNutrition]);

  const calculateWithParams = useCallback(async (
    weight: number,
    height: number, 
    age: number,
    gender: string,
    activityLevel: string,
    objective: string,
    profile: string
  ): Promise<CompleteNutritionalResult | null> => {
    console.log('🧮 useCalculator: calculateWithParams (legacy) delegando para sistema consolidado');
    
    // Map legacy values to new system
    const consolidatedParams: ConsolidatedNutritionParams = {
      weight,
      height,
      age,
      gender: gender === 'M' || gender === 'male' ? 'M' : 'F',
      activityLevel: mapActivityLevelToNew(activityLevel as any),
      objective: mapObjectiveToNew(objective as any),
      profile: mapProfileToNew(profile as any)
    };

    return await calculateNutrition(consolidatedParams);
  }, [calculateNutrition]);

  const reset = useCallback(() => {
    console.log('🔄 useCalculator: Reset delegando para sistema consolidado');
    setFormData(initialFormData);
    clearResults();
  }, [clearResults]);

  return {
    formData,
    results,
    isCalculating,
    error,
    updateFormData,
    calculate,
    reset,
    // Legacy compatibility
    hasActivePatient: false,
    activePatient: null,
    calculateWithParams
  };
};

// Legacy wrapper function
export const useNutritionCalculator = () => {
  console.warn('[DEPRECATED] useNutritionCalculator wrapper - Use useCalculator ou useConsolidatedNutrition diretamente');
  const calculator = useCalculator();
  return calculator;
};
