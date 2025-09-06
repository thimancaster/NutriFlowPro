import { useState } from 'react';
import { calculateTMB_ENP } from '@/utils/nutrition/enp/core';
import { calculateGEA_ENP } from '@/utils/nutrition/enp/core';
import { calculateGET_ENP } from '@/utils/nutrition/enp/core';
import { calculateMacros_ENP } from '@/utils/nutrition/enp/macros';

export interface SimpleCalculationInputs {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: string;
}

export interface SimpleCalculationResult {
  tmb: number;
  gea: number;
  get: number;
  vet: number;
  macros: {
    protein: { grams: number; kcal: number };
    carbs: { grams: number; kcal: number };
    fat: { grams: number; kcal: number };
  };
}

export const useCalculatorFix = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SimpleCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (inputs: SimpleCalculationInputs) => {
    console.log('[CALC:FIX] 🧮 Calculando com inputs:', inputs);
    setIsCalculating(true);
    setError(null);

    try {
      // 1. Calcular TMB
      const tmb = calculateTMB_ENP(inputs.weight, inputs.height, inputs.age, inputs.sex);
      console.log('[CALC:FIX] TMB calculado:', tmb);

      // 2. Calcular GEA
      const gea = calculateGEA_ENP(tmb, inputs.activityLevel as any);
      console.log('[CALC:FIX] GEA calculado:', gea);

      // 3. Calcular GET (com ajuste por objetivo)
      const get = calculateGET_ENP(gea, inputs.objective as any);
      console.log('[CALC:FIX] GET calculado:', get);

      // VET = GET para compatibilidade
      const vet = get;

      // 4. Calcular macros
      const macros = calculateMacros_ENP(get, inputs.weight, inputs.objective as any, inputs.profile as any);
      console.log('[CALC:FIX] Macros calculados:', macros);

      const calculationResult: SimpleCalculationResult = {
        tmb,
        gea,
        get,
        vet,
        macros
      };

      setResult(calculationResult);
      console.log('[CALC:FIX] ✅ Cálculo concluído:', calculationResult);
      
      return calculationResult;
    } catch (err: any) {
      console.error('[CALC:FIX] ❌ Erro no cálculo:', err);
      setError(err.message || 'Erro no cálculo');
      throw err;
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    calculate,
    reset,
    isCalculating,
    result,
    error,
    hasResult: !!result
  };
};