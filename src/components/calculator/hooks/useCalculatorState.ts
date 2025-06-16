
import { useState } from 'react';
import { Profile } from '@/types/consultation';
import { Patient } from '@/types';
import { useCalculatorForm } from './useCalculatorForm';
import { useCalculatorResults } from './useCalculatorResults';

const useCalculatorState = () => {
  const [activeTab, setActiveTab] = useState<'tmb' | 'activity' | 'results'>('tmb');
  
  const {
    formData,
    handleInputChange,
    handleProfileChange,
    resetForm,
    weight,
    height,
    age,
    sex,
    activityLevel,
    objective,
    profile,
    patientName
  } = useCalculatorForm();

  const {
    results,
    isCalculating,
    showResults,
    handleCalculate,
    resetResults,
    tmbValue,
    teeObject,
    macros,
    calorieSummary,
    formulaUsed
  } = useCalculatorResults();

  const handleCalculateWrapper = () => {
    handleCalculate(
      Number(weight),
      Number(height),
      Number(age),
      sex,
      activityLevel,
      objective,
      profile
    );
    setActiveTab('results');
  };

  const handleReset = () => {
    resetForm();
    resetResults();
    setActiveTab('tmb');
  };

  const syncPatientData = (patient: Patient) => {
    handleInputChange('patientName', patient.name);
    handleInputChange('weight', (patient as any).weight || weight);
    handleInputChange('height', (patient as any).height || height);
    handleInputChange('age', (patient as any).age || age);
    handleInputChange('sex', patient.gender === 'male' ? 'M' : 'F');
  };

  // Compatibility methods
  const setSex = (sex: 'M' | 'F') => handleInputChange('sex', sex);
  const setActivityLevel = (level: string) => handleInputChange('activityLevel', level);
  const setObjective = (objective: string) => handleInputChange('objective', objective);

  return {
    // Form data
    weight,
    height,
    age,
    sex,
    activityLevel,
    objective,
    profile,
    patientName,
    
    // Results
    tmbValue,
    teeObject,
    macros,
    calorieSummary,
    formulaUsed,
    
    // UI State
    showResults,
    isCalculating,
    activeTab,
    
    // Actions
    handleInputChange,
    handleProfileChange,
    handleCalculate: handleCalculateWrapper,
    handleReset,
    setActiveTab,
    syncPatientData,
    
    // Compatibility methods
    setSex,
    setActivityLevel,
    setObjective
  };
};

export default useCalculatorState;
