
import { useState } from 'react';
import { calculateCompleteNutrition, CompleteNutritionResult, validateAllParameters } from '@/utils/nutrition/completeCalculation';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface NutritionCalculationState {
  results: CompleteNutritionResult | null;
  isCalculating: boolean;
  error: string | null;
}

export interface UseCalculatorReturn extends NutritionCalculationState {
  calculate: (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: ActivityLevel,
    objective: Objective,
    profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta',
    customMacroPercentages?: {
      protein: number;
      carbs: number;
      fat: number;
    }
  ) => Promise<CompleteNutritionResult | null>;
  reset: () => void;
}

export const useCalculator = (): UseCalculatorReturn => {
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
    profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta',
    customMacroPercentages?: {
      protein: number;
      carbs: number;
      fat: number;
    }
  ): Promise<CompleteNutritionResult | null> => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      // Mapear profile para formato esperado pela função
      const mappedProfile = profile === 'eutrofico' ? 'magro' : 
                           profile === 'sobrepeso_obesidade' ? 'obeso' : 'atleta';
      
      // Validar parâmetros
      const validation = validateAllParameters(weight, height, age, sex, activityLevel, objective, mappedProfile);
      
      if (!validation.isValid) {
        throw new Error(`Parâmetros inválidos: ${validation.errors.join(', ')}`);
      }

      // Executar cálculo
      const results = await calculateCompleteNutrition(
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        mappedProfile,
        customMacroPercentages
      );

      setState({
        results,
        isCalculating: false,
        error: null
      });

      console.log('Cálculo nutricional ENP concluído:', {
        formula: results.formula,
        tmb: results.tmb,
        get: results.get,
        vet: results.vet,
        adjustment: results.adjustment,
        profile: mappedProfile,
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

// Export da função de cálculo para compatibilidade
export const useNutritionCalculation = useCalculator;
