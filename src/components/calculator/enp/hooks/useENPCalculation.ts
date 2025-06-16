
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateGER } from '@/utils/nutrition/gerCalculations';
import { calculateMacros } from '@/utils/nutrition/macroCalculations';
import { ACTIVITY_FACTORS, OBJECTIVE_FACTORS } from '@/types/consultation';
import { GERFormula } from '@/types/gerFormulas';

export interface ENPResults {
  tmb: number;
  gea: number;
  get: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
  };
  gerFormula: GERFormula;
  gerFormulaName: string;
  proteinPerKg: number;
}

export interface ENPValidatedData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: string;
  gerFormula: GERFormula;
  bodyFatPercentage?: number;
}

export const useENPCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ENPResults | null>(null);
  const { toast } = useToast();

  const validateFormulaRequirements = (
    formula: GERFormula,
    bodyFatPercentage?: number
  ): { isValid: boolean; error?: string } => {
    const formulasRequiringBodyFat: GERFormula[] = ['katch_mcardle', 'cunningham'];
    
    if (formulasRequiringBodyFat.includes(formula) && !bodyFatPercentage) {
      return {
        isValid: false,
        error: `A fórmula ${formula === 'katch_mcardle' ? 'Katch-McArdle' : 'Cunningham'} requer o percentual de gordura corporal.`
      };
    }
    
    return { isValid: true };
  };

  const handleCalculate = async (validatedData: ENPValidatedData, isValid: boolean) => {
    if (!isValid) {
      setError('Dados inválidos para o cálculo');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Validar requisitos específicos da fórmula
      const formulaValidation = validateFormulaRequirements(
        validatedData.gerFormula,
        validatedData.bodyFatPercentage
      );

      if (!formulaValidation.isValid) {
        throw new Error(formulaValidation.error);
      }

      // 1. Calcular GER usando a fórmula selecionada
      const gerResult = calculateGER(validatedData.gerFormula, {
        weight: validatedData.weight,
        height: validatedData.height,
        age: validatedData.age,
        sex: validatedData.sex,
        bodyFatPercentage: validatedData.bodyFatPercentage
      });

      // 2. Calcular GEA (Gasto Energético de Atividade)
      const activityFactor = ACTIVITY_FACTORS[validatedData.activityLevel as keyof typeof ACTIVITY_FACTORS] || 1.2;
      const gea = Math.round(gerResult.ger * activityFactor);

      // 3. Calcular GET (Gasto Energético Total) com ajuste por objetivo
      const objectiveFactor = OBJECTIVE_FACTORS[validatedData.objective as keyof typeof OBJECTIVE_FACTORS] || 1.0;
      let get = gea;
      
      // Aplicar ajustes específicos por objetivo conforme ENP
      switch (validatedData.objective) {
        case 'emagrecimento':
          get = gea - 500; // Déficit de 500 kcal
          break;
        case 'hipertrofia':
          get = gea + 400; // Superávit de 400 kcal
          break;
        case 'manutenção':
        default:
          get = gea; // Sem ajuste
          break;
      }

      // 4. Calcular macronutrientes usando o sistema unificado
      const macrosResult = calculateMacros(
        get,
        validatedData.weight,
        validatedData.objective as any,
        validatedData.profile as any
      );

      // 5. Montar resultado final
      const finalResults: ENPResults = {
        tmb: gerResult.ger,
        gea,
        get,
        macros: {
          protein: {
            grams: macrosResult.protein.grams,
            kcal: macrosResult.protein.kcal,
            percentage: macrosResult.protein.percentage
          },
          carbs: {
            grams: macrosResult.carbs.grams,
            kcal: macrosResult.carbs.kcal,
            percentage: macrosResult.carbs.percentage
          },
          fat: {
            grams: macrosResult.fat.grams,
            kcal: macrosResult.fat.kcal,
            percentage: macrosResult.fat.percentage
          }
        },
        gerFormula: validatedData.gerFormula,
        gerFormulaName: gerResult.formulaName,
        proteinPerKg: macrosResult.proteinPerKg
      };

      setResults(finalResults);
      
      toast({
        title: "Cálculo realizado com sucesso",
        description: `TMB: ${finalResults.tmb} kcal | GET: ${finalResults.get} kcal (${gerResult.formulaName})`,
      });

      console.log('Cálculo ENP concluído:', {
        formula: gerResult.formulaName,
        tmb: finalResults.tmb,
        gea: finalResults.gea,
        get: finalResults.get,
        macros: finalResults.macros
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no cálculo';
      setError(errorMessage);
      
      toast({
        title: "Erro no cálculo",
        description: errorMessage,
        variant: "destructive"
      });

      console.error('Erro no cálculo ENP:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
    setIsCalculating(false);
  };

  return {
    isCalculating,
    error,
    results,
    handleCalculate,
    reset
  };
};
