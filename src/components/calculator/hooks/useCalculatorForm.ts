
import { useState } from 'react';
import { CalculatorState } from '../types';
import { getInitialCalculatorState } from '../utils/initialState';

/**
 * Hook to manage calculator form state - always starts with empty fields
 */
export const useCalculatorForm = () => {
  // Always start with empty initial state
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(getInitialCalculatorState);
  
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

  // Reset function to clear all fields
  const resetForm = () => {
    setCalculatorState(getInitialCalculatorState());
    // Clear all localStorage entries related to calculator
    localStorage.removeItem('calculatorState');
    localStorage.removeItem('calculatorFormState');
    localStorage.removeItem('calculatorResults');
  };

  // Optional function to populate from patient data (manual action)
  const populateFromPatient = (patientData: any) => {
    if (patientData) {
      setCalculatorState(prev => ({
        ...prev,
        patientName: patientData.name || '',
        weight: patientData.weight?.toString() || '',
        height: patientData.height?.toString() || '',
        age: patientData.age?.toString() || '',
        gender: patientData.gender === 'male' ? 'male' : 'female'
      }));
    }
  };

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
    setConsultationType,
    
    // Actions
    resetForm,
    populateFromPatient
  };
};
