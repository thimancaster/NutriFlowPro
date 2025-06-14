
import { useCallback } from 'react';
import { useENPFormState } from './hooks/useENPFormState';
import { useENPValidation } from './hooks/useENPValidation';
import { useENPCalculation } from './hooks/useENPCalculation';
import { useENPExport } from './hooks/useENPExport';

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
    exportLogic.handleExportResults(calculation.results, validation.validatedData);
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
