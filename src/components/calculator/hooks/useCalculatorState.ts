
import { useState, useEffect } from 'react';
import { Profile, ActivityLevel, Objective } from '@/types/consultation';
import { useToast } from '@/components/ui/use-toast';
import { useCalculator } from '@/hooks/useCalculator';
import {
  mapProfileToNew,
  mapProfileToLegacy,
  mapActivityLevelToNew,
  mapActivityLevelToLegacy,
  mapObjectiveToNew,
  mapObjectiveToLegacy,
  mapGenderToNew
} from '@/utils/nutrition/typeMapping';

const useCalculatorState = () => {
  const [activeTab, setActiveTab] = useState<'tmb' | 'activity' | 'results'>('tmb');
  const { toast } = useToast();
  
  const {
    formData,
    updateFormData,
    results,
    isCalculating,
    error,
    reset: resetCalculator,
    calculate
  } = useCalculator();

  // State for cache information
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean;
    cacheAge?: number;
  }>({
    fromCache: false
  });

  const [showResults, setShowResults] = useState(false);

  // Derived values from formData with type conversion
  const weight = formData.weight.toString();
  const height = formData.height.toString();
  const age = formData.age.toString();
  const sex = formData.gender;
  const activityLevel = mapActivityLevelToLegacy(formData.activityLevel);
  const objective = mapObjectiveToLegacy(formData.objective);
  const profile = mapProfileToLegacy(formData.profile);
  const patientName = ''; // Legacy compatibility
  const activePatient = null; // Legacy compatibility

  const handleInputChange = (name: string, value: any) => {
    const updates: any = {};
    
    switch (name) {
      case 'weight':
        updates.weight = Number(value) || 0;
        break;
      case 'height':
        updates.height = Number(value) || 0;
        break;
      case 'age':
        updates.age = Number(value) || 0;
        break;
      case 'gender':
      case 'sex':
        updates.gender = mapGenderToNew(value);
        break;
      case 'activityLevel':
        updates.activityLevel = mapActivityLevelToNew(value as ActivityLevel);
        break;
      case 'objective':
        updates.objective = mapObjectiveToNew(value as Objective);
        break;
      case 'profile':
        updates.profile = mapProfileToNew(value as Profile);
        break;
    }
    
    updateFormData(updates);
  };

  const handleProfileChange = (value: string) => {
    updateFormData({ profile: mapProfileToNew(value as Profile) });
  };

  const handleCalculateWrapper = async () => {
    console.log('=== INICIANDO CÁLCULO ===');
    console.log('Dados do formulário:', formData);

    setCacheInfo({ fromCache: false });

    // Use the unified calculator
    const nutritionResults = await calculate();
    
    if (nutritionResults) {
      console.log('Resultados do cálculo:', nutritionResults);
      
      toast({
        title: "Cálculo Realizado",
        description: `Novos resultados calculados`,
      });
      
      setShowResults(true);
      setActiveTab('results');
      console.log('=== CÁLCULO CONCLUÍDO COM SUCESSO ===');
    } else {
      console.error('=== FALHA NO CÁLCULO ===');
      toast({
        title: "Erro no Cálculo",
        description: "Não foi possível realizar o cálculo. Verifique os dados inseridos.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    console.log('=== RESETANDO CALCULADORA ===');
    resetCalculator();
    setCacheInfo({ fromCache: false });
    setShowResults(false);
    setActiveTab('tmb');
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
    
    // Results - convert unified results to legacy format
    tmbValue: results?.tmb.value || null,
    teeObject: results ? {
      tmb: results.tmb.value,
      get: results.get,
      vet: results.vet,
      adjustment: results.adjustment
    } : null,
    macros: results?.macros || null,
    calorieSummary: results ? {
      totalCalories: results.vet,
      proteinCalories: results.macros.protein.kcal,
      carbsCalories: results.macros.carbs.kcal,
      fatCalories: results.macros.fat.kcal
    } : null,
    formulaUsed: results?.formulaUsed || null,
    
    // Cache info
    fromCache: cacheInfo.fromCache,
    cacheAge: cacheInfo.cacheAge,
    
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
    
    // Compatibility methods
    setSex,
    setActivityLevel,
    setObjective
  };
};

export default useCalculatorState;
