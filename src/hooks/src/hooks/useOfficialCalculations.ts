/**
 * HOOK OFICIAL DE CÁLCULOS NUTRICIONAIS - NutriFlowPro
 * Centraliza chamadas ao motor oficial (officialCalculations.ts)
 */

import { useState, useCallback } from 'react';
import {
  calculateCompleteNutrition,
  validatePatientData,
  validateMacroConfig,
  getAvailableFormulas,
  getActivityLevels,
  type PatientData,
  type MacroConfig,
  type CalculationResult,
  type TMBFormula,
  type ActivityLevel
} from '../utils/nutrition/official/officialCalculations';

interface UseOfficialCalcState {
  result: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;
}

export function useOfficialCalculations() {
  const [state, setState] = useState<UseOfficialCalcState>({
    result: null,
    isCalculating: false,
    error: null
  });

  // Função principal
  const calculate = useCallback((params: {
    patientData: PatientData;
    macroConfig: MacroConfig;
    energyAdjustment?: number;
    formula?: TMBFormula;
  }) => {
    try {
      setState({ ...state, isCalculating: true, error: null });

      // validação
      const errors = [
        ...validatePatientData(params.patientData),
        ...validateMacroConfig(params.macroConfig)
      ];
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const result = calculateCompleteNutrition(
        params.patientData,
        params.macroConfig,
        params.energyAdjustment || 0,
        params.formula || 'harris-benedict'
      );

      setState({ result, isCalculating: false, error: null });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no cálculo';
      setState({ result: null, isCalculating: false, error: msg });
      return null;
    }
  }, [state]);

  return {
    ...state,
    calculate,
    availableFormulas: getAvailableFormulas(),
    activityLevels: getActivityLevels()
  };
}

export type {
  PatientData,
  MacroConfig,
  CalculationResult,
  TMBFormula,
  ActivityLevel
} from '../utils/nutrition/official/officialCalculations';
