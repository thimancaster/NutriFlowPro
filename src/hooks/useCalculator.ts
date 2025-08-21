
/**
 * Hook Unificado para Cálculos Nutricionais
 * [UPDATED] Agora usa o motor nutricional centralizado que é 100% fiel à planilha
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Usar o motor nutricional centralizado
import { 
  calculateCompleteNutrition,
  validateInputs,
  type CalculationInputs,
  type CompleteNutritionalResult
} from '@/utils/nutrition/centralMotor';

export interface UseCalculatorReturn {
  formData: CalculationInputs;
  results: CompleteNutritionalResult | null;
  isCalculating: boolean;
  error: string | null;
  updateFormData: (data: Partial<CalculationInputs>) => void;
  calculate: () => Promise<CompleteNutritionalResult | null>;
  reset: () => void;
}

const initialFormData: CalculationInputs = {
  weight: 0,
  height: 0, 
  age: 0,
  gender: 'F',
  profile: 'eutrofico',
  activityLevel: 'moderado', 
  objective: 'manutencao'
};

export const useCalculator = (): UseCalculatorReturn => {
  const [formData, setFormData] = useState<CalculationInputs>(initialFormData);
  const [results, setResults] = useState<CompleteNutritionalResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateFormData = useCallback((data: Partial<CalculationInputs>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setError(null);
  }, []);

  const calculate = useCallback(async (): Promise<CompleteNutritionalResult | null> => {
    console.log('🧮 Iniciando cálculo nutricional com motor centralizado:', formData);
    
    setIsCalculating(true);
    setError(null);

    try {
      // Validar dados de entrada usando validação do motor centralizado
      const validation = validateInputs(formData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Calcular usando motor centralizado (100% fiel à planilha)
      const calculationResults = calculateCompleteNutrition(formData);

      console.log('✅ Cálculo concluído com motor centralizado:', {
        tmb: calculationResults.tmb.value,
        formula: calculationResults.tmb.formula,
        get: calculationResults.get,
        profileUsed: calculationResults.profileUsed,
        formulaUsed: calculationResults.formulaUsed
      });

      setResults(calculationResults);

      toast({
        title: "Cálculo Realizado",
        description: `TMB: ${calculationResults.tmb.value} kcal | GET: ${calculationResults.get} kcal`,
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
  }, [formData, toast]);

  const reset = useCallback(() => {
    console.log('🔄 Resetando calculadora nutricional');
    setFormData(initialFormData);
    setResults(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return {
    formData,
    results,
    isCalculating,
    error,
    updateFormData,
    calculate,
    reset
  };
};
