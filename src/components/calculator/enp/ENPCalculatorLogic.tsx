
import { useCallback } from 'react';
import { useENPFormState } from './hooks/useENPFormState';
import { useENPValidation } from './hooks/useENPValidation';
import { useENPCalculation } from './hooks/useENPCalculation';
import { useENPExport } from './hooks/useENPExport';
import { ActivityLevel, Objective } from '@/types/consultation';

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
  const calculation = useENPCalculation();
  const exportLogic = useENPExport();
  
  const handleCalculate = useCallback(async () => {
    await calculation.handleCalculate(validation.validatedData, validation.isValid);
  }, [calculation, validation]);

  const handleExportResults = useCallback(() => {
    // Transform validated data to match export interface
    const exportData = {
      ...validation.validatedData,
      activityLevel: validation.validatedData.activityLevel as ActivityLevel,
      objective: validation.validatedData.objective as Objective,
      bodyFatPercentage: validation.validatedData.bodyFatPercentage || 0
    };
    exportLogic.handleExportResults(calculation.results, exportData);
  }, [exportLogic, calculation.results, validation.validatedData]);

  const handleReset = useCallback(() => {
    formState.resetForm();
    calculation.reset();
  }, [formState, calculation]);

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
    isCalculating: calculation.isCalculating,
    error: calculation.error,
    results: calculation.results
  };
};
