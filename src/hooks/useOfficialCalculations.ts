/**
 * OFFICIAL CALCULATIONS HOOK - SINGLE SOURCE OF TRUTH
 * Provides access to official nutrition calculations with proper state management
 * This is the ONLY hook that should be used for nutritional calculations.
 */

import { useState, useCallback } from 'react';
import {
  calculateComplete_Official,
  validateMealDistribution,
  validateCalculationInputs,
  type CalculationInputs,
  type CalculationResult,
  type ManualMacroInputs,
  type PercentageMacroInputs
} from '@/utils/nutrition/official/officialCalculations';
import { useToast } from '@/hooks/use-toast';

export interface OfficialCalculationState {
  inputs: Partial<CalculationInputs>;
  results: CalculationResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: OfficialCalculationState = {
  inputs: {
    macroInputs: { proteinPerKg: 1.6, fatPerKg: 1.0 } // Default values
  },
  results: null,
  loading: false,
  error: null
};

export const useOfficialCalculations = () => {
  const [state, setState] = useState<OfficialCalculationState>(initialState);
  const { toast } = useToast();

  // Update calculation inputs
  const updateInputs = useCallback((updates: Partial<CalculationInputs>) => {
    setState(prev => ({
      ...prev,
      inputs: { ...prev.inputs, ...updates },
      error: null
    }));
  }, []);

  // Update macro inputs specifically
  const updateMacroInputs = useCallback((macroInputs: ManualMacroInputs) => {
    setState(prev => ({
      ...prev,
      inputs: { ...prev.inputs, macroInputs },
      error: null
    }));
  }, []);

  // Update percentage inputs specifically
  const updatePercentageInputs = useCallback((percentageInputs: PercentageMacroInputs) => {
    setState(prev => ({
      ...prev,
      inputs: { ...prev.inputs, percentageInputs, macroInputs: undefined },
      error: null
    }));
  }, []);

  // Validate inputs before calculation (uses official validation)
  const validateInputs = useCallback((inputs: Partial<CalculationInputs>) => {
    return validateCalculationInputs(inputs);
  }, []);

  // Perform official calculation
  const calculate = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validate inputs using official validation
      const validation = validateInputs(state.inputs);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }

      // Ensure we have complete inputs
      const completeInputs = state.inputs as CalculationInputs;

      // Perform calculation using official formulas
      const results = calculateComplete_Official(completeInputs);

      setState(prev => ({
        ...prev,
        results,
        loading: false,
        error: null
      }));

      toast({
        title: "Cálculo Concluído",
        description: `TMB: ${results.tmb.value} kcal | VET: ${results.vet} kcal`,
      });

      return results;

    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido no cálculo';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast({
        title: "Erro no Cálculo",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    }
  }, [state.inputs, validateInputs, toast]);

  // Reset all state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Get calculation preview (without full calculation)
  const getPreview = useCallback(() => {
    const { weight, macroInputs, percentageInputs } = state.inputs;
    
    if (!weight) return null;

    if (macroInputs) {
      return {
        proteinGrams: Math.round(macroInputs.proteinPerKg * weight * 10) / 10,
        proteinKcal: Math.round(macroInputs.proteinPerKg * weight * 4),
        fatGrams: Math.round(macroInputs.fatPerKg * weight * 10) / 10,
        fatKcal: Math.round(macroInputs.fatPerKg * weight * 9),
        inputMethod: 'grams_per_kg' as const
      };
    }

    if (percentageInputs) {
      // Rough preview based on estimated VET of 2000 kcal
      const estimatedVet = 2000;
      return {
        proteinKcal: Math.round((estimatedVet * percentageInputs.proteinPercent) / 100),
        fatKcal: Math.round((estimatedVet * percentageInputs.fatPercent) / 100),
        inputMethod: 'percentages' as const
      };
    }

    return null;
  }, [state.inputs]);

  // Validate meal distribution
  const validateMealDist = useCallback((distribution: Record<string, number>) => {
    return validateMealDistribution(distribution);
  }, []);

  // Check if ready to calculate
  const canCalculate = useCallback(() => {
    const validation = validateInputs(state.inputs);
    return validation.isValid && !state.loading;
  }, [state.inputs, state.loading, validateInputs]);

  // Get current validation status
  const getValidation = useCallback(() => {
    return validateInputs(state.inputs);
  }, [state.inputs, validateInputs]);

  return {
    // State
    inputs: state.inputs,
    results: state.results,
    loading: state.loading,
    error: state.error,

    // Actions
    updateInputs,
    updateMacroInputs,
    updatePercentageInputs,
    calculate,
    reset,

    // Utilities
    getPreview,
    validateMealDist,
    canCalculate,
    getValidation,
    validateInputs: (inputs?: Partial<CalculationInputs>) => 
      validateInputs(inputs || state.inputs)
  };
};