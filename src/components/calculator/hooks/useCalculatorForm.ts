
import { useState, useEffect } from 'react';
import { CalculatorState } from '../types';
import { getInitialCalculatorState } from '../utils/initialState';
import { getCalculatorState, saveCalculatorState } from '../storageUtils';

/**
 * Hook to manage calculator form state
 */
export const useCalculatorForm = () => {
  // Try to restore state from storage on initial render
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(() => {
    return getCalculatorState() || getInitialCalculatorState();
  });
  
  // Save state to storage whenever it changes
  useEffect(() => {
    saveCalculatorState(calculatorState);
  }, [calculatorState]);
  
  // Destructure state values for easier access
  const {
    patientName,
    gender,
    age,
    weight,
    height,
    objective,
    activityLevel,
    consultationType,
    profile,
    carbsPercentage,
    proteinPercentage,
    fatPercentage
  } = calculatorState;
  
  // Setter functions for each state property
  const setPatientName = (value: string) => setCalculatorState(prev => ({ ...prev, patientName: value }));
  const setGender = (value: "male" | "female") => setCalculatorState(prev => ({ ...prev, gender: value }));
  const setAge = (value: string) => setCalculatorState(prev => ({ ...prev, age: value }));
  const setWeight = (value: string) => setCalculatorState(prev => ({ ...prev, weight: value }));
  const setHeight = (value: string) => setCalculatorState(prev => ({ ...prev, height: value }));
  const setObjective = (value: string) => setCalculatorState(prev => ({ ...prev, objective: value }));
  const setActivityLevel = (value: string) => setCalculatorState(prev => ({ ...prev, activityLevel: value }));
  const setCarbsPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, carbsPercentage: value }));
  const setProteinPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, proteinPercentage: value }));
  const setFatPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, fatPercentage: value }));
  const setProfile = (value: string) => setCalculatorState(prev => ({ ...prev, profile: value }));
  const setConsultationType = (value: 'primeira_consulta' | 'retorno') => 
    setCalculatorState(prev => ({ ...prev, consultationType: value }));

  return {
    // State values
    patientName,
    gender,
    age,
    weight,
    height,
    objective,
    activityLevel,
    consultationType,
    profile,
    carbsPercentage,
    proteinPercentage,
    fatPercentage,
    
    // Setters
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
  };
};
