
import { useState, useCallback, useEffect } from 'react';
import { CalculatorState, UseCalculatorStateProps } from './types';
import { 
  getInitialCalculatorState, 
  validateCalculatorInputs, 
  calculateBMR, 
  calculateMacros 
} from './calculatorUtils';
import { 
  saveCalculatorState, 
  saveCalculatorResults, 
  getCalculatorState, 
  getCalculatorResults,
  saveConsultationData,
  clearCalculatorData as clearCalcData
} from './storageUtils';
import { saveTemporaryPatient } from './patientUtils';

const useCalculatorState = ({ toast, user, setConsultationData }: UseCalculatorStateProps) => {
  // Try to restore state from storage on initial render
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(() => {
    return getCalculatorState() || getInitialCalculatorState();
  });

  // Results states
  const [bmr, setBmr] = useState<number | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.bmr || null;
  });
  
  const [tee, setTee] = useState<number | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.tee || null;
  });
  
  const [macros, setMacros] = useState<{ carbs: number, protein: number, fat: number } | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.macros || null;
  });
  
  // Calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Temp patient id state
  const [tempPatientId, setTempPatientId] = useState<string | null>(() => {
    const savedResults = getCalculatorResults();
    return savedResults?.tempPatientId || null;
  });
  
  // Save state to storage whenever it changes
  useEffect(() => {
    saveCalculatorState(calculatorState);
  }, [calculatorState]);
  
  // Save results to storage whenever they change
  useEffect(() => {
    if (bmr && tee && macros) {
      saveCalculatorResults(bmr, tee, macros, tempPatientId);
    }
  }, [bmr, tee, macros, tempPatientId]);
  
  // Setter functions for each state property
  const setPatientName = (value: string) => setCalculatorState(prev => ({ ...prev, patientName: value }));
  const setGender = (value: string) => setCalculatorState(prev => ({ ...prev, gender: value }));
  const setAge = (value: string) => setCalculatorState(prev => ({ ...prev, age: value }));
  const setWeight = (value: string) => setCalculatorState(prev => ({ ...prev, weight: value }));
  const setHeight = (value: string) => setCalculatorState(prev => ({ ...prev, height: value }));
  const setObjective = (value: string) => setCalculatorState(prev => ({ ...prev, objective: value }));
  const setActivityLevel = (value: string) => setCalculatorState(prev => ({ ...prev, activityLevel: value }));
  const setCarbsPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, carbsPercentage: value }));
  const setProteinPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, proteinPercentage: value }));
  const setFatPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, fatPercentage: value }));

  const validateInputs = useCallback((): boolean => {
    return validateCalculatorInputs(
      calculatorState.age, 
      calculatorState.weight, 
      calculatorState.height, 
      toast
    );
  }, [calculatorState.age, calculatorState.weight, calculatorState.height, toast]);

  const calculateResults = useCallback(async (state: CalculatorState) => {
    if (!validateInputs()) {
      return;
    }
    
    setIsCalculating(true);
    
    // Calculate BMR
    const calculatedBmr = calculateBMR(
      state.gender,
      state.weight,
      state.height,
      state.age
    );
    
    setBmr(calculatedBmr);
    
    // Calculate Total Energy Expenditure with the selected activity factor
    const activityFactor = parseFloat(state.activityLevel);
    const calculatedTee = calculatedBmr * activityFactor;
    setTee(Math.round(calculatedTee));
    
    // Calculate macronutrients with updated distribution
    const calculatedMacros = calculateMacros(
      calculatedTee,
      state.carbsPercentage,
      state.proteinPercentage,
      state.fatPercentage
    );
    
    setMacros(calculatedMacros);
    
    // Store calculation data for meal plan and future reference
    const consultationData = {
      weight: state.weight,
      height: state.height,
      age: state.age,
      sex: state.gender === 'male' ? 'M' : 'F',
      objective: state.objective,
      profile: 'magro', // Default profile
      activityLevel: state.activityLevel,
      results: {
        tmb: calculatedBmr,
        fa: activityFactor,
        get: Math.round(calculatedTee),
        macros: {
          protein: calculatedMacros.protein,
          carbs: calculatedMacros.carbs,
          fat: calculatedMacros.fat
        }
      }
    };
    
    setConsultationData(consultationData);
    
    // Also store in localStorage for persistence between pages
    saveConsultationData(consultationData);
    
    // If we have a name, create a temporary patient
    if (state.patientName && user) {
      const newPatientId = await saveTemporaryPatient(
        state,
        user,
        tempPatientId,
        calculatedBmr,
        calculatedTee,
        calculatedMacros
      );
      
      if (newPatientId && !tempPatientId) {
        setTempPatientId(newPatientId);
      }
    }
    
    setIsCalculating(false);
    
    toast({
      title: "Cálculo realizado com sucesso",
      description: "Os resultados do cálculo TMB e GET estão disponíveis na aba Resultados."
    });
    
    return true;
  }, [validateInputs, tempPatientId, user, toast, setConsultationData]);

  // Clear all calculator data
  const clearCalculatorData = useCallback(() => {
    clearCalcData();
    
    setCalculatorState(getInitialCalculatorState());
    
    setBmr(null);
    setTee(null);
    setMacros(null);
    setTempPatientId(null);
  }, []);

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
    calculateResults,
    clearCalculatorData,
    bmr,
    tee,
    macros,
    tempPatientId,
    setTempPatientId
  };
};

export default useCalculatorState;
