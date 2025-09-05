/**
 * Calculadora Simplificada para resolver o problema imediato
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SimpleCalculationInputs {
  weight: number;
  height: number;
  age: number;
  gender: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: string;
}

interface SimpleCalculationResult {
  bmr: number;
  get: number;
  vet: number;
  protein: number;
  carbs: number;
  fats: number;
  tmb: {
    value: number;
    formula: string;
  };
  macros: {
    protein: {
      grams: number;
      kcal: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      kcal: number;
      percentage: number;
    };
    fat: {
      grams: number;
      kcal: number;
      percentage: number;
    };
  };
}

const initialFormData: SimpleCalculationInputs = {
  weight: 0,
  height: 0,
  age: 0,
  gender: 'F',
  activityLevel: 'moderado',
  objective: 'manutenção',
  profile: 'eutrofico'
};

export const useSimpleCalculator = () => {
  const [formData, setFormData] = useState<SimpleCalculationInputs>(initialFormData);
  const [results, setResults] = useState<SimpleCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateFormData = useCallback((data: Partial<SimpleCalculationInputs>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const calculate = useCallback(async (inputData?: any): Promise<SimpleCalculationResult | null> => {
    const dataToUse = inputData || formData;
    
    console.log('[CALC:SIMPLE] Iniciando cálculo com:', dataToUse);
    
    setIsCalculating(true);
    setError(null);
    
    try {
      // Validação básica
      if (!dataToUse.weight || !dataToUse.height || !dataToUse.age) {
        throw new Error('Dados incompletos: peso, altura e idade são obrigatórios');
      }

      // Cálculo TMB usando Harris-Benedict
      const isMale = dataToUse.gender === 'M' || dataToUse.sex === 'male';
      const bmr = isMale
        ? 88.362 + (13.397 * dataToUse.weight) + (4.799 * dataToUse.height) - (5.677 * dataToUse.age)
        : 447.593 + (9.247 * dataToUse.weight) + (3.098 * dataToUse.height) - (4.330 * dataToUse.age);

      // Fatores de atividade
      const activityFactors: Record<string, number> = {
        'sedentario': 1.2,
        'leve': 1.375,
        'moderado': 1.55,
        'intenso': 1.725,
        'extremo': 1.9
      };

      const activityFactor = activityFactors[dataToUse.activityLevel] || 1.55;
      const get = bmr * activityFactor;

      // Ajuste por objetivo
      let vet = get;
      if (dataToUse.objective?.includes('emagrecimento') || dataToUse.objective?.includes('Perder')) {
        vet = get * 0.85; // 15% déficit
      } else if (dataToUse.objective?.includes('hipertrofia') || dataToUse.objective?.includes('ganho')) {
        vet = get * 1.15; // 15% superávit
      }

      // Distribuição de macronutrientes
      const protein = Math.round(dataToUse.weight * 2.2); // 2.2g por kg
      const fats = Math.round(vet * 0.25 / 9); // 25% das calorias em gordura
      const carbs = Math.round((vet - (protein * 4) - (fats * 9)) / 4); // Resto em carboidratos

      const result: SimpleCalculationResult = {
        bmr: Math.round(bmr),
        get: Math.round(get),
        vet: Math.round(vet),
        protein,
        carbs,
        fats,
        tmb: {
          value: Math.round(bmr),
          formula: 'Harris-Benedict Revisada'
        },
        macros: {
          protein: {
            grams: protein,
            kcal: protein * 4,
            percentage: Math.round((protein * 4 / vet) * 100)
          },
          carbs: {
            grams: carbs,
            kcal: carbs * 4,
            percentage: Math.round((carbs * 4 / vet) * 100)
          },
          fat: {
            grams: fats,
            kcal: fats * 9,
            percentage: Math.round((fats * 9 / vet) * 100)
          }
        }
      };

      console.log('[CALC:SIMPLE] Resultado calculado:', result);
      
      setResults(result);
      
      toast({
        title: "Cálculo Realizado com Sucesso",
        description: `TMB: ${result.bmr} kcal | VET: ${result.vet} kcal`,
      });

      return result;
      
    } catch (err: any) {
      console.error('[CALC:SIMPLE] Erro no cálculo:', err);
      const errorMessage = err.message || 'Erro desconhecido no cálculo';
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
    setFormData(initialFormData);
    setResults(null);
    setError(null);
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