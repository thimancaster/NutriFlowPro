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
  CompleteNutritionalResult,
  TMBResult
} from '@/utils/nutrition/centralMotor/enpCore';
import { PatientInput } from '@/types';

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

  const calculate = useCallback(async (params?: any): Promise<CompleteNutritionalResult | null> => {
    const inputsToUse = params || {
      id: 'temp-calc',
      sex: formData.gender === 'M' ? 'male' as const : 'female' as const,
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      objective: mapObjectiveToLegacy(formData.objective),
      activityLevel: mapActivityLevelToLegacy(formData.activityLevel),
      profile: mapProfileToLegacy(formData.profile)
    };
    
    console.log('🧮 useCalculator: Delegando para sistema consolidado:', inputsToUse);
    
    try {
      const result = await calculateNutrition(inputsToUse);
      
      const tmbResult: TMBResult = {
        value: result.bmr,
        formula: 'harris_benedict',
        details: 'Calculation completed'
      };

      const mealDistribution: Record<string, { calories: number; protein: number; carbs: number; fat: number; }> = {};
      
      return {
        ...result,
        tmb: tmbResult,
        mealDistribution,
        profileUsed: inputsToUse.profile as any,
        proteinPerKg: Math.round(result.macros.protein.grams / inputsToUse.weight),
        gea: result.gea || 0
      } as CompleteNutritionalResult;
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
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
    const calculationInput: PatientInput = {
      id: 'temp-calc',
      sex: gender === 'M' || gender === 'male' ? 'male' as const : 'female' as const,
      gender: gender === 'M' || gender === 'male' ? 'M' as const : 'F' as const,
      weight,
      height,
      age,
      activityLevel: mapActivityLevelToNew(activityLevel as any),
      objective: mapObjectiveToNew(objective as any),
      profile: mapProfileToNew(profile as any)
    };

    try {
      const result = await calculateNutrition(calculationInput);
      
      // Convert to expected legacy format with proper types
      const tmbResult: TMBResult = {
        value: result.bmr,
        formula: 'harris_benedict',
        details: 'Calculation completed'
      };

      const mealDistribution: Record<string, { calories: number; protein: number; carbs: number; fat: number; }> = {};
      
      return {
        ...result,
        tmb: tmbResult,
        mealDistribution,
        profileUsed: profile as any,
        proteinPerKg: Math.round(result.macros.protein.grams / weight),
        gea: result.gea || 0
      } as CompleteNutritionalResult;
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [calculateNutrition]);

  const reset = useCallback(() => {
    console.log('🔄 useCalculator: Reset delegando para sistema consolidado');
    setFormData(initialFormData);
    clearResults();
  }, [clearResults]);

  return {
    formData,
    results: results ? {
      ...results,
      tmb: results.tmb ? { ...results.tmb, details: 'Calculation completed' } : { value: results.bmr, formula: 'harris_benedict' as const, details: 'Calculation completed' },
      mealDistribution: {} as Record<string, { calories: number; protein: number; carbs: number; fat: number; }>,
      profileUsed: formData.profile as any,
      proteinPerKg: formData.weight > 0 ? Math.round((results.macros?.protein?.grams || 0) / formData.weight) : 0
    } as any : null,
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