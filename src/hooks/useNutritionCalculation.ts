
import { useState } from 'react';
import { calculateCompleteNutritionLegacy, LegacyCalculationResult, validateLegacyParameters } from '@/utils/nutrition/legacyCalculations';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface NutritionCalculationState {
  results: LegacyCalculationResult | null;
  isCalculating: boolean;
  error: string | null;
}

export const useNutritionCalculation = () => {
  const [state, setState] = useState<NutritionCalculationState>({
    results: null,
    isCalculating: false,
    error: null
  });

  const calculate = async (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: ActivityLevel,
    objective: Objective,
    profile: 'magro' | 'obeso' | 'atleta',
    customMacroPercentages?: {
      protein: number;
      carbs: number;
      fat: number;
    }
  ): Promise<LegacyCalculationResult | null> => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      // Validar parâmetros using legacy function
      const validation = validateLegacyParameters(weight, height, age, sex, activityLevel, objective, profile);
      
      if (!validation.isValid) {
        throw new Error(`Parâmetros inválidos: ${validation.errors.join(', ')}`);
      }

      // Use legacy calculation function with 7 parameters
      const results = calculateCompleteNutritionLegacy(
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        profile
      );

      setState({
        results,
        isCalculating: false,
        error: null
      });

      console.log('Cálculo nutricional concluído:', {
        formulaUsed: results.formulaUsed,
        tmb: results.tmb,
        vet: results.vet,
        profile,
        recommendations: results.recommendations
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no cálculo nutricional';
      
      setState({
        results: null,
        isCalculating: false,
        error: errorMessage
      });

      console.error('Erro no cálculo nutricional:', error);
      return null;
    }
  };

  const reset = () => {
    setState({
      results: null,
      isCalculating: false,
      error: null
    });
  };

  return {
    ...state,
    calculate,
    reset
  };
};
