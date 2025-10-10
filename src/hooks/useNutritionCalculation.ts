import { useState } from 'react';
import { 
  calculateComplete_Official, 
  type CalculationInputs,
  type CalculationResult
} from '@/utils/nutrition/official/officialCalculations';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface NutritionCalculationState {
  results: CalculationResult | null;
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
    profile: 'magro' | 'obeso' | 'atleta' | 'eutrofico' | 'sobrepeso_obesidade'
  ): Promise<CalculationResult | null> => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      // Normalize profile
      const normalizedProfile = 
        profile === 'magro' ? 'eutrofico' :
        profile === 'obeso' ? 'sobrepeso_obesidade' :
        profile === 'eutrofico' ? 'eutrofico' :
        profile === 'sobrepeso_obesidade' ? 'sobrepeso_obesidade' :
        'atleta';

      const inputs: CalculationInputs = {
        weight,
        height,
        age,
        gender: sex,
        profile: normalizedProfile,
        activityLevel,
        objective,
        macroInputs: {
          proteinPerKg: normalizedProfile === 'atleta' ? 2.0 : 1.6,
          fatPerKg: 1.0
        }
      };

      const results = await calculateComplete_Official(inputs);

      setState({
        results,
        isCalculating: false,
        error: null
      });

      console.log('Cálculo nutricional concluído:', {
        formulaUsed: results.tmb.formula,
        tmb: results.tmb.value,
        vet: results.vet,
        profile: normalizedProfile
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
