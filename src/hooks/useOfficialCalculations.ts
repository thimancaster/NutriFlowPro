/**
 * OFFICIAL CALCULATIONS HOOK
 * Provides access to official nutrition calculations with proper state management
 */

import { useState, useCallback } from 'react';
import {
  calculateComplete_Official,
  validateMealDistribution,
  type CalculationInputs,
  type CalculationResult,
  type ManualMacroInputs
} from '@/utils/nutrition/official/formulas';
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

  // Validate inputs before calculation
  const validateInputs = useCallback((inputs: Partial<CalculationInputs>): string[] => {
    const errors: string[] = [];

    if (!inputs.weight || inputs.weight <= 0) {
      errors.push('Peso é obrigatório e deve ser maior que zero');
    }
    if (!inputs.height || inputs.height <= 0) {
      errors.push('Altura é obrigatória e deve ser maior que zero');
    }
    if (!inputs.age || inputs.age <= 0) {
      errors.push('Idade é obrigatória e deve ser maior que zero');
    }
    if (!inputs.gender) {
      errors.push('Sexo é obrigatório');
    }
    if (!inputs.profile) {
      errors.push('Perfil corporal é obrigatório');
    }
    if (!inputs.activityLevel) {
      errors.push('Nível de atividade é obrigatório');
    }
    if (!inputs.objective) {
      errors.push('Objetivo é obrigatório');
    }
    if (!inputs.macroInputs?.proteinPerKg || inputs.macroInputs.proteinPerKg <= 0) {
      errors.push('Proteína por kg deve ser maior que zero');
    }
    if (!inputs.macroInputs?.fatPerKg || inputs.macroInputs.fatPerKg <= 0) {
      errors.push('Gordura por kg deve ser maior que zero');
    }

    // Nutritional validation
    if (inputs.macroInputs?.proteinPerKg && inputs.macroInputs.proteinPerKg > 5) {
      errors.push('Proteína muito alta (>5g/kg). Verifique o valor.');
    }
    if (inputs.macroInputs?.fatPerKg && inputs.macroInputs.fatPerKg > 3) {
      errors.push('Gordura muito alta (>3g/kg). Verifique o valor.');
    }

    return errors;
  }, []);

  // Perform official calculation
  const calculate = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validate inputs
      const validationErrors = validateInputs(state.inputs);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('. '));
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
    const { weight, macroInputs } = state.inputs;
    
    if (!weight || !macroInputs) return null;

    return {
      proteinGrams: Math.round(macroInputs.proteinPerKg * weight * 10) / 10,
      proteinKcal: Math.round(macroInputs.proteinPerKg * weight * 4),
      fatGrams: Math.round(macroInputs.fatPerKg * weight * 10) / 10,
      fatKcal: Math.round(macroInputs.fatPerKg * weight * 9)
    };
  }, [state.inputs]);

  // Validate meal distribution
  const validateMealDist = useCallback((distribution: Record<string, number>) => {
    return validateMealDistribution(distribution);
  }, []);

  // Check if ready to calculate
  const canCalculate = useCallback(() => {
    const errors = validateInputs(state.inputs);
    return errors.length === 0 && !state.loading;
  }, [state.inputs, state.loading, validateInputs]);

  return {
    // State
    inputs: state.inputs,
    results: state.results,
    loading: state.loading,
    error: state.error,

    // Actions
    updateInputs,
    updateMacroInputs,
    calculate,
    reset,

    // Utilities
    getPreview,
    validateMealDist,
    canCalculate,
    validateInputs: (inputs?: Partial<CalculationInputs>) => 
      validateInputs(inputs || state.inputs)
  };
};