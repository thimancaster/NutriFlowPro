
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  calcularNutricaoPlanilha, 
  validarInputsPlanilha,
  type CalculoPlanilhaInputs,
  type CalculoPlanilhaResult
} from '@/utils/nutrition/planilhaCalculations';

export const usePlanilhaCalculator = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculoPlanilhaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculate = async (inputs: CalculoPlanilhaInputs): Promise<CalculoPlanilhaResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validar inputs
      const validation = validarInputsPlanilha(inputs);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // Realizar cálculo
      const calculationResult = await calcularNutricaoPlanilha(inputs);
      
      setResult(calculationResult);
      
      toast({
        title: "Cálculo Realizado",
        description: `TMB: ${calculationResult.tmb} kcal | GET: ${calculationResult.get} kcal | VET: ${calculationResult.vet} kcal`,
      });

      console.log('🧮 Cálculo da planilha concluído:', {
        inputs,
        result: calculationResult,
        formula: calculationResult.formula_aplicada
      });

      return calculationResult;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro no cálculo nutricional';
      setError(errorMessage);
      
      toast({
        title: "Erro no Cálculo",
        description: errorMessage,
        variant: "destructive"
      });

      console.error('❌ Erro no cálculo da planilha:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsCalculating(false);
  };

  return {
    calculate,
    reset,
    isCalculating,
    result,
    error
  };
};
