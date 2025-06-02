
import { useCallback } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { ActivityLevel, Objective } from '@/types/consultation';

interface CalculationData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
}

export const useENPCalculation = () => {
  const calculator = useCalculator();
  
  const handleCalculate = useCallback(async (data: CalculationData, isValid: boolean) => {
    if (!isValid) return;
    
    try {
      const result = await calculator.calculate(
        data.weight,
        data.height,
        data.age,
        data.sex,
        data.activityLevel,
        data.objective,
        'eutrofico' // Profile padrão - será ajustado pelo nutricionista se necessário
      );
      
      // Callback is handled by the calculator internally
    } catch (error) {
      console.error('Erro no cálculo ENP:', error);
    }
  }, [calculator]);

  return {
    handleCalculate,
    isCalculating: calculator.isCalculating,
    error: calculator.error,
    results: calculator.results
  };
};
