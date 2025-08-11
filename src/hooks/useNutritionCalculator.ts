
import { useState, useCallback } from 'react';
import { calculateCompleteNutrition, CalculationInputs, CalculationResults, Profile, Gender, Objective } from '@/utils/calculations/core';
import { useToast } from '@/hooks/use-toast';

export interface UseNutritionCalculatorReturn {
  results: CalculationResults | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (inputs: CalculationInputs) => Promise<CalculationResults | null>;
  reset: () => void;
}

export const useNutritionCalculator = (): UseNutritionCalculatorReturn => {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculate = useCallback(async (inputs: CalculationInputs): Promise<CalculationResults | null> => {
    console.log('🧮 Iniciando cálculo nutricional:', inputs);
    
    setIsCalculating(true);
    setError(null);

    try {
      // Validação básica
      if (!inputs.weight || inputs.weight <= 0) {
        throw new Error('Peso deve ser maior que zero');
      }
      if (!inputs.height || inputs.height <= 0) {
        throw new Error('Altura deve ser maior que zero');
      }
      if (!inputs.age || inputs.age <= 0) {
        throw new Error('Idade deve ser maior que zero');
      }

      // Realizar cálculo usando sistema único
      const calculationResults = calculateCompleteNutrition(inputs);

      console.log('✅ Cálculo concluído:', {
        tmb: calculationResults.tmb,
        get: calculationResults.get,
        vet: calculationResults.vet,
        totalCalories: calculationResults.totalCalories
      });

      setResults(calculationResults);

      toast({
        title: "Cálculo Realizado",
        description: `TMB: ${calculationResults.tmb} kcal | VET: ${calculationResults.vet} kcal`,
      });

      return calculationResults;
    } catch (error: any) {
      console.error('❌ Erro no cálculo:', error);
      const errorMessage = error.message || 'Erro no cálculo nutricional';
      setError(errorMessage);
      
      toast({
        title: "Erro no Cálculo",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    console.log('🔄 Resetando calculadora nutricional');
    setResults(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return {
    results,
    isCalculating,
    error,
    calculate,
    reset
  };
};

// Wrapper para compatibilidade com código existente
export const useCalculator = () => {
  const nutrition = useNutritionCalculator();
  
  return {
    ...nutrition,
    formData: {
      weight: 0,
      height: 0,
      age: 0,
      sex: 'F' as Gender,
      activityLevel: 'moderado',
      objective: 'manutencao' as Objective,
      profile: 'eutrofico' as Profile
    },
    updateFormData: (data: Partial<any>) => {
      console.log('📝 Atualizando dados do formulário:', data);
    }
  };
};
