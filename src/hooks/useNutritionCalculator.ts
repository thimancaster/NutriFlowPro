import { useState, useCallback } from 'react';
import { 
  calculateComplete_Official, 
  type CalculationInputs, 
  type CalculationResult 
} from '@/utils/nutrition/official/officialCalculations';
import { useToast } from '@/hooks/use-toast';

export interface UseNutritionCalculatorReturn {
  results: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (inputs: CalculationInputs) => Promise<CalculationResult | null>;
  reset: () => void;
}

export const useNutritionCalculator = (): UseNutritionCalculatorReturn => {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculate = useCallback(async (inputs: CalculationInputs): Promise<CalculationResult | null> => {
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

      // Usar motor oficial
      const calculationResults = calculateComplete_Official(inputs);

      console.log('✅ Cálculo concluído:', {
        tmb: calculationResults.tmb.value,
        get: calculationResults.get,
        vet: calculationResults.vet
      });

      setResults(calculationResults);

      toast({
        title: "Cálculo Realizado",
        description: `TMB: ${calculationResults.tmb.value} kcal | VET: ${calculationResults.vet} kcal`,
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

// Alias para compatibilidade
export const useCalculator = useNutritionCalculator;
