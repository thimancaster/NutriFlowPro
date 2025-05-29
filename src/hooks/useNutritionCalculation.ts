
import { useState } from 'react';
import { Profile, ActivityLevel, Objective } from '@/types/consultation';
import { calculateCompleteNutrition, validateNutritionInputs } from '@/utils/nutritionCalculations';
import { useToast } from '@/hooks/use-toast';

interface NutritionResults {
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
  formulaUsed: string;
}

export const useNutritionCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<NutritionResults | null>(null);
  const { toast } = useToast();

  const calculate = async (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: ActivityLevel,
    objective: Objective,
    profile: Profile
  ): Promise<NutritionResults | null> => {
    setIsCalculating(true);
    
    try {
      // Validar inputs
      const validationError = validateNutritionInputs(weight, height, age);
      if (validationError) {
        toast({
          title: 'Dados Inválidos',
          description: validationError,
          variant: 'destructive'
        });
        return null;
      }

      // Realizar cálculos usando a função modular consolidada
      const calculationResults = calculateCompleteNutrition(
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        profile
      );

      setResults(calculationResults);
      
      toast({
        title: 'Cálculo Realizado',
        description: `Necessidades nutricionais calculadas usando ${calculationResults.formulaUsed}`,
      });

      return calculationResults;
    } catch (error: any) {
      console.error('Erro no cálculo nutricional:', error);
      toast({
        title: 'Erro no Cálculo',
        description: 'Ocorreu um erro ao calcular os valores nutricionais',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setResults(null);
  };

  return {
    calculate,
    reset,
    isCalculating,
    results
  };
};
