
import { useCallback } from 'react';
import { useENPFormState } from './hooks/useENPFormState';
import { useENPValidation } from './hooks/useENPValidation';
import { useCalculator } from '@/hooks/useCalculator';
import { useENPExport } from './hooks/useENPExport';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';

export const useENPCalculatorLogic = () => {
  const formState = useENPFormState();
  const validation = useENPValidation(
    formState.weight,
    formState.height,
    formState.age,
    formState.sex,
    formState.activityLevel,
    formState.objective,
    formState.profile,
    formState.gerFormula,
    formState.bodyFatPercentage
  );
  const calculator = useCalculator();
  const exportLogic = useENPExport();
  
  const handleCalculate = useCallback(async () => {
    if (!validation.isValid) {
      return;
    }

    const calculationData = {
      weight: validation.validatedData.weight,
      height: validation.validatedData.height,
      age: validation.validatedData.age,
      sex: validation.validatedData.sex,
      activityLevel: validation.validatedData.activityLevel as ActivityLevel,
      objective: validation.validatedData.objective as Objective,
      profile: validation.validatedData.profile as Profile,
      bodyFatPercentage: validation.validatedData.bodyFatPercentage
    };

    await calculator.calculate(calculationData);
  }, [calculator, validation]);

  const handleExportResults = useCallback(() => {
    if (!calculator.results) return;

    // Transform validated data to match export interface
    const exportData = {
      ...validation.validatedData,
      activityLevel: validation.validatedData.activityLevel as ActivityLevel,
      objective: validation.validatedData.objective as Objective,
      profile: validation.validatedData.profile as Profile,
      bodyFatPercentage: validation.validatedData.bodyFatPercentage || 0
    };
    exportLogic.handleExportResults(calculator.results, exportData);
  }, [exportLogic, calculator.results, validation.validatedData]);

  const handleReset = useCallback(() => {
    formState.resetForm();
    calculator.reset();
  }, [formState, calculator]);

  return {
    // Form state
    ...formState,
    
    // Validation
    validatedData: validation.validatedData,
    isValid: validation.isValid,
    validationErrors: validation.errors,
    validationWarnings: validation.warnings,
    
    // Actions
    handleCalculate,
    handleExportResults,
    handleReset,
    
    // Calculator state
    isCalculating: calculator.isCalculating,
    error: calculator.error,
    results: calculator.results
  };
};
