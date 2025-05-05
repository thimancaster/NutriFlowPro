
import { useState, useCallback } from 'react';
import { UseCalculatorStateProps } from './types';
import { 
  useCalculatorForm,
  useCalculatorResults,
  useCalculationLogic,
  usePatientActions
} from './hooks';
import { clearCalculatorData as clearCalcData } from './storageUtils';
import { getInitialCalculatorState } from './utils/initialState';

/**
 * Main hook for calculator state management
 */
const useCalculatorState = ({ toast, user, setConsultationData }: UseCalculatorStateProps) => {
  // Form state management
  const calculatorFormHook = useCalculatorForm();
  const { 
    calculatorState,
    setPatientName,
    setGender,
    setAge,
    setWeight,
    setHeight,
    setObjective,
    setActivityLevel,
    setCarbsPercentage,
    setProteinPercentage,
    setFatPercentage
  } = calculatorFormHook;

  // Results state management
  const {
    bmr,
    setBmr,
    tee,
    setTee,
    macros,
    setMacros,
    tempPatientId,
    setTempPatientId
  } = useCalculatorResults();
  
  // Calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculation logic
  const { calculateResults } = useCalculationLogic({
    setBmr,
    setTee,
    setMacros,
    tempPatientId,
    setTempPatientId,
    setConsultationData,
    toast,
    user
  });
  
  // Patient actions
  const { 
    handleSavePatient, 
    handleGenerateMealPlan, 
    isSavingPatient 
  } = usePatientActions({
    calculatorState,
    bmr,
    tee,
    macros,
    tempPatientId,
    setConsultationData,
    toast,
    user
  });
  
  // Calculation with loading state
  const performCalculation = useCallback(async (state) => {
    setIsCalculating(true);
    try {
      await calculateResults(state);
    } finally {
      setIsCalculating(false);
    }
  }, [calculateResults]);
  
  // Clear all calculator data
  const clearCalculatorData = useCallback(() => {
    clearCalcData();
    
    // Reset form state
    const initialState = getInitialCalculatorState();
    Object.keys(initialState).forEach(key => {
      const setter = `set${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof calculatorFormHook;
      if (typeof calculatorFormHook[setter] === 'function') {
        // @ts-ignore - We know these setters exist but TypeScript doesn't
        calculatorFormHook[setter](initialState[key as keyof typeof initialState]);
      }
    });
    
    // Reset results
    setBmr(null);
    setTee(null);
    setMacros(null);
    setTempPatientId(null);
  }, [calculatorFormHook, setBmr, setTee, setMacros, setTempPatientId]);

  return {
    calculatorState,
    setPatientName,
    setGender,
    setAge,
    setWeight,
    setHeight,
    setObjective,
    setActivityLevel,
    setCarbsPercentage,
    setProteinPercentage,
    setFatPercentage,
    isCalculating,
    calculateResults: performCalculation,
    clearCalculatorData,
    bmr,
    tee,
    macros,
    tempPatientId,
    setTempPatientId,
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  };
};

export default useCalculatorState;
