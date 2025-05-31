
import { useState } from 'react';
import { useNutritionCalculation } from './useNutritionCalculation';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface CalculatorResults {
  tmb: number;
  get: number;
  vet: number;
  adjustment: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
}

export const useCalculator = () => {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nutritionCalculation = useNutritionCalculation();

  const calculate = async (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: ActivityLevel,
    objective: Objective,
    profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' | 'magro' | 'obeso' = 'eutrofico'
  ): Promise<CalculatorResults | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Map profile to simplified format for ENP
      const mappedProfile = profile === 'eutrofico' || profile === 'magro' ? 'magro' :
                           profile === 'sobrepeso_obesidade' || profile === 'obeso' ? 'obeso' : 'atleta';

      const result = await nutritionCalculation.calculate(
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        mappedProfile
      );

      if (result) {
        const calculatorResults: CalculatorResults = {
          tmb: result.tmb,
          get: result.get,
          vet: result.vet,
          adjustment: result.adjustment,
          macros: {
            protein: {
              grams: result.macros.protein.grams,
              kcal: result.macros.protein.kcal,
              percentage: result.macros.protein.percentage
            },
            carbs: {
              grams: result.macros.carbs.grams,
              kcal: result.macros.carbs.kcal,
              percentage: result.macros.carbs.percentage
            },
            fat: {
              grams: result.macros.fat.grams,
              kcal: result.macros.fat.kcal,
              percentage: result.macros.fat.percentage
            },
            proteinPerKg: result.macros.proteinPerKg
          }
        };

        setResults(calculatorResults);
        return calculatorResults;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no cálculo ENP';
      setError(errorMessage);
      console.error('Erro no cálculo:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
    setIsCalculating(false);
    nutritionCalculation.reset();
  };

  return {
    results,
    isCalculating,
    error,
    calculate,
    reset
  };
};
