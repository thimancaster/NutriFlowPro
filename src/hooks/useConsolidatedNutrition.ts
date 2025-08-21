
/**
 * HOOK CONSOLIDADO PARA CÁLCULOS NUTRICIONAIS
 * 
 * Este é o hook único que deve ser usado para todos os cálculos nutricionais.
 * Utiliza exclusivamente o motor centralizado que é 100% fiel à planilha.
 * 
 * SUBSTITUI: useCalculator, useUnifiedCalculator, useNutritionCalculator
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  calculateCompleteNutrition,
  validateInputs,
  type CalculationInputs,
  type CompleteNutritionalResult
} from '@/utils/nutrition/centralMotor';

export interface ConsolidatedNutritionParams {
  weight: number;
  height: number;
  age: number;
  gender: 'M' | 'F';
  activityLevel: 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo';
  objective: 'manutencao' | 'emagrecimento' | 'hipertrofia';
  profile: 'eutrofico' | 'obeso_sobrepeso' | 'atleta';
}

export interface ConsolidatedNutritionReturn {
  // Estado
  results: CompleteNutritionalResult | null;
  isCalculating: boolean;
  error: string | null;
  
  // Ações
  calculateNutrition: (params: ConsolidatedNutritionParams) => Promise<CompleteNutritionalResult | null>;
  clearResults: () => void;
  
  // Utilitários
  validateParameters: (params: ConsolidatedNutritionParams) => { isValid: boolean; errors: string[] };
  
  // Dados calculados derivados (para compatibilidade)
  tmb: number | null;
  gea: number | null;
  get: number | null;
  vet: number | null;
  macros: {
    protein: { grams: number; kcal: number; percentage: number } | null;
    carbs: { grams: number; kcal: number; percentage: number } | null;
    fat: { grams: number; kcal: number; percentage: number } | null;
  };
}

export const useConsolidatedNutrition = (): ConsolidatedNutritionReturn => {
  const [results, setResults] = useState<CompleteNutritionalResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateParameters = useCallback((params: ConsolidatedNutritionParams) => {
    const errors: string[] = [];
    
    if (!params.weight || params.weight <= 0 || params.weight > 500) {
      errors.push('Peso deve estar entre 1 e 500 kg');
    }
    
    if (!params.height || params.height <= 0 || params.height > 250) {
      errors.push('Altura deve estar entre 1 e 250 cm');
    }
    
    if (!params.age || params.age <= 0 || params.age > 120) {
      errors.push('Idade deve estar entre 1 e 120 anos');
    }
    
    if (!['M', 'F'].includes(params.gender)) {
      errors.push('Gênero deve ser M ou F');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const calculateNutrition = useCallback(async (
    params: ConsolidatedNutritionParams
  ): Promise<CompleteNutritionalResult | null> => {
    console.log('🧮 Iniciando cálculo nutricional consolidado:', params);
    
    setIsCalculating(true);
    setError(null);

    try {
      // Validar parâmetros de entrada
      const validation = validateParameters(params);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Preparar dados para o motor central
      const calculationInputs: CalculationInputs = {
        weight: params.weight,
        height: params.height,
        age: params.age,
        gender: params.gender,
        activityLevel: params.activityLevel,
        objective: params.objective,
        profile: params.profile
      };

      // Validar com motor central
      const motorValidation = validateInputs(calculationInputs);
      if (!motorValidation.isValid) {
        throw new Error(motorValidation.errors.join(', '));
      }

      // Executar cálculos usando motor central (100% fiel à planilha)
      const calculationResults = calculateCompleteNutrition(calculationInputs);

      console.log('✅ Cálculo consolidado concluído:', {
        tmb: calculationResults.tmb.value,
        formula: calculationResults.tmb.formula,
        gea: calculationResults.gea,
        get: calculationResults.get,
        vet: calculationResults.vet,
        profileUsed: calculationResults.profileUsed,
        formulaUsed: calculationResults.formulaUsed,
        macros: {
          protein: `${calculationResults.macros.protein.grams}g (${calculationResults.macros.protein.kcal} kcal)`,
          carbs: `${calculationResults.macros.carbs.grams}g (${calculationResults.macros.carbs.kcal} kcal)`,
          fat: `${calculationResults.macros.fat.grams}g (${calculationResults.macros.fat.kcal} kcal)`
        }
      });

      setResults(calculationResults);

      toast({
        title: "Cálculo Nutricional Concluído",
        description: `TMB: ${calculationResults.tmb.value} kcal | GET: ${calculationResults.get} kcal | Fórmula: ${calculationResults.formulaUsed}`,
      });

      return calculationResults;
      
    } catch (error: any) {
      console.error('❌ Erro no cálculo consolidado:', error);
      const errorMessage = error.message || 'Erro no cálculo nutricional';
      setError(errorMessage);
      
      toast({
        title: "Erro no Cálculo Nutricional",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [validateParameters, toast]);

  const clearResults = useCallback(() => {
    console.log('🔄 Limpando resultados do cálculo consolidado');
    setResults(null);
    setError(null);
  }, []);

  // Dados derivados para compatibilidade com código existente
  const tmb = results?.tmb.value || null;
  const gea = results?.gea || null;
  const get = results?.get || null;
  const vet = results?.vet || null;
  
  const macros = {
    protein: results?.macros.protein || null,
    carbs: results?.macros.carbs || null,
    fat: results?.macros.fat || null
  };

  return {
    // Estado
    results,
    isCalculating,
    error,
    
    // Ações
    calculateNutrition,
    clearResults,
    
    // Utilitários
    validateParameters,
    
    // Compatibilidade
    tmb,
    gea,
    get,
    vet,
    macros
  };
};

/**
 * WRAPPER PARA COMPATIBILIDADE COM CÓDIGO LEGADO
 * 
 * [DEPRECATED] - Use useConsolidatedNutrition diretamente
 */
export const useNutritionCalculator = () => {
  console.warn('[DEPRECATED] useNutritionCalculator - Use useConsolidatedNutrition diretamente');
  return useConsolidatedNutrition();
};

/**
 * WRAPPER PARA COMPATIBILIDADE COM SISTEMA UNIFICADO
 * 
 * [DEPRECATED] - Use useConsolidatedNutrition diretamente
 */
export const useUnifiedNutrition = () => {
  console.warn('[DEPRECATED] useUnifiedNutrition - Use useConsolidatedNutrition diretamente');
  return useConsolidatedNutrition();
};
