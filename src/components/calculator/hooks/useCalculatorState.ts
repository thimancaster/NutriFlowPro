
import { useState } from 'react';
import { Profile } from '@/types/consultation';
import { Patient } from '@/types';
import { useCalculatorForm } from './useCalculatorForm';
import { useCalculatorResults } from './useCalculatorResults';
import { useCalculatorActions } from './useCalculatorActions';
import { useCalculatorSync } from './useCalculatorSync';

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
    setIsCalculating,
    setResults,
    setShowResults,
    resetResults,
    tmbValue,
    teeObject,
    macros,
    calorieSummary,
    formulaUsed
  } = useCalculatorResults();

  const { validateAndCalculate } = useCalculatorActions();
  const { syncPatientData } = useCalculatorSync();

  const handleCalculateWrapper = async () => {
    setIsCalculating(true);

    const calculationParams = {
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      sex,
      activityLevel,
      objective,
      profile
    };

    const nutritionResults = await validateAndCalculate(calculationParams);
    
    if (nutritionResults) {
      const calculationResults = {
        tmbValue: nutritionResults.tmb,
        teeObject: {
          tmb: nutritionResults.tmb,
          get: nutritionResults.get,
          vet: nutritionResults.vet,
          adjustment: nutritionResults.vet - nutritionResults.get
        },
        macros: {
          protein: nutritionResults.macros.protein,
          carbs: nutritionResults.macros.carbs,
          fat: nutritionResults.macros.fat,
          proteinPerKg: nutritionResults.proteinPerKg
        },
        calorieSummary: {
          totalCalories: nutritionResults.vet,
          proteinCalories: nutritionResults.macros.protein.kcal,
          carbsCalories: nutritionResults.macros.carbs.kcal,
          fatCalories: nutritionResults.macros.fat.kcal
        },
        formulaUsed: nutritionResults.formulaUsed
      };

      setResults(calculationResults);
      setShowResults(true);
      setActiveTab('results');
    }

    setIsCalculating(false);
  };

  const handleReset = () => {
    resetForm();
    resetResults();
    setActiveTab('tmb');
  };

  const handleSyncPatientData = (patient: Patient) => {
    const currentData = { patientName, weight, height, age, sex };
    syncPatientData(patient, currentData, handleInputChange);
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
    syncPatientData: handleSyncPatientData,
    
    // Compatibility methods
    setSex,
    setActivityLevel,
    setObjective
  };
};

export default useCalculatorState;
