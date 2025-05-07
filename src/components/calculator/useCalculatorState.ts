
import { useState, useCallback, useEffect } from 'react';
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
const useCalculatorState = ({ toast, user, setConsultationData, activePatient }: UseCalculatorStateProps) => {
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
    setFatPercentage,
    setProfile,
    setConsultationType
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
  
  // Pre-fill data from active patient if available
  useEffect(() => {
    if (activePatient) {
      setPatientName(activePatient.name || '');
      
      if (activePatient.gender) {
        // Map gender from database format to component format
        setGender(activePatient.gender === 'M' ? 'male' : 'female');
      }
      
      // Calculate age from birth_date if available
      if (activePatient.birth_date) {
        const birthDate = new Date(activePatient.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setAge(age.toString());
      }

      // Set objective if available in patient goals
      if (activePatient.goals?.objective) {
        setObjective(activePatient.goals.objective);
      }

      // Set profile if available in patient goals
      if (activePatient.goals?.profile) {
        setProfile(activePatient.goals.profile);
      }

      // Set consultation type to follow-up since this is an existing patient
      setConsultationType('retorno');
    }
  }, [activePatient]);

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
    setProfile,
    setConsultationType,
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
