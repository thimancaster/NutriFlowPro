
/**
 * Results management for calculator
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateCompleteNutritionLegacy, LegacyCalculationResult, validateLegacyParameters } from '@/utils/nutrition/legacyCalculations';
import { mapProfileToCalculation } from '@/utils/nutrition/macroCalculations';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface CalculationResults {
  tmbValue: number;
  teeObject: {
    tmb: number;
    get: number;
    vet: number;
    adjustment: number;
  };
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
  calorieSummary: any;
  formulaUsed: string;
}

export const useCalculatorResults = () => {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: string,
    objective: string,
    profile: string
  ) => {
    // Validation
    if (!weight || !height || !age) {
      toast({
        title: "Dados incompletos",
        description: "Preencha peso, altura e idade para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // UI feedback

      // Map profile to calculation type
      const mappedProfile = mapProfileToCalculation(profile as any);
      
      // Use the legacy function with the correct signature (7 parameters)
      const nutritionResults = calculateCompleteNutritionLegacy(
        weight,
        height,
        age,
        sex,
        activityLevel as ActivityLevel,
        objective as Objective,
        mappedProfile
      );

      const calculationResults: CalculationResults = {
        tmbValue: nutritionResults.tmb,
        teeObject: {
          tmb: nutritionResults.tmb,
          get: nutritionResults.get,
          vet: nutritionResults.vet,
          adjustment: nutritionResults.vet - nutritionResults.get
        },
        macros: {
          protein: nutritionResults.macros.protein,
          carbs: nutritionResults.macros.carbs,
          fat: nutritionResults.macros.fat,
          proteinPerKg: nutritionResults.proteinPerKg
        },
        calorieSummary: {
          totalCalories: nutritionResults.vet,
          proteinCalories: nutritionResults.macros.protein.kcal,
          carbsCalories: nutritionResults.macros.carbs.kcal,
          fatCalories: nutritionResults.macros.fat.kcal
        },
        formulaUsed: nutritionResults.formulaUsed
      };

      setResults(calculationResults);
      setShowResults(true);

      toast({
        title: "Cálculo realizado com sucesso",
        description: `Utilizada fórmula: ${nutritionResults.formulaUsed}`,
      });

    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao realizar os cálculos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const resetResults = () => {
    setResults(null);
    setShowResults(false);
  };

  return {
    results,
    isCalculating,
    showResults,
    handleCalculate,
    resetResults,
    // Individual result accessors for compatibility
    tmbValue: results?.tmbValue || null,
    teeObject: results?.teeObject || null,
    macros: results?.macros || null,
    calorieSummary: results?.calorieSummary || null,
    formulaUsed: results?.formulaUsed
  };
};
