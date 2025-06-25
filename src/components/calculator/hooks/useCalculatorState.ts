
import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { Patient } from '@/types';
import { useCalculatorForm } from './useCalculatorForm';
import { useCalculatorResults } from './useCalculatorResults';
import { useCalculatorActions } from './useCalculatorActions';
import { useCalculatorSync } from './useCalculatorSync';
import { useToast } from '@/hooks/use-toast';

const useCalculatorState = () => {
  const [activeTab, setActiveTab] = useState<'tmb' | 'activity' | 'results'>('tmb');
  const { toast } = useToast();
  
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

  // State for cache information
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean;
    cacheAge?: number;
  }>({
    fromCache: false
  });

  const handleCalculateWrapper = async () => {
    console.log('=== INICIANDO CÁLCULO ===');
    console.log('Dados do formulário:', {
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      sex,
      activityLevel,
      objective,
      profile
    });

    setIsCalculating(true);
    setCacheInfo({ fromCache: false });

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
      console.log('Resultados do cálculo:', nutritionResults);
      
      // Check if result came from cache
      const fromCache = nutritionResults.fromCache || false;
      const cacheAge = nutritionResults.cacheAge;

      setCacheInfo({ 
        fromCache, 
        cacheAge 
      });

      // Show toast with cache information
      if (fromCache) {
        toast({
          title: "Resultado do Cache",
          description: `Cálculo recuperado do cache (${cacheAge ? Math.floor(cacheAge / 1000) + 's' : 'recente'})`,
        });
      } else {
        toast({
          title: "Cálculo Realizado",
          description: `Novos resultados calculados e salvos no cache`,
        });
      }
      
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
      console.log('=== CÁLCULO CONCLUÍDO COM SUCESSO ===');
    } else {
      console.error('=== FALHA NO CÁLCULO ===');
      toast({
        title: "Erro no Cálculo",
        description: "Não foi possível realizar o cálculo. Verifique os dados inseridos.",
        variant: "destructive"
      });
    }

    setIsCalculating(false);
  };

  const handleReset = () => {
    console.log('=== RESETANDO CALCULADORA ===');
    resetForm();
    resetResults();
    setCacheInfo({ fromCache: false });
    setActiveTab('tmb');
  };

  const handleSyncPatientData = (patient: Patient) => {
    console.log('=== SINCRONIZANDO DADOS DO PACIENTE ===', patient);
    const currentData = { patientName, weight, height, age, sex };
    syncPatientData(patient, currentData, handleInputChange);
  };

  // Compatibility methods
  const setSex = (sex: 'M' | 'F') => handleInputChange('sex', sex);
  const setActivityLevel = (level: string) => handleInputChange('activityLevel', level);
  const setObjective = (objective: string) => handleInputChange('objective', objective);

  // Debug effect para monitorar mudanças no profile
  useEffect(() => {
    console.log('Profile changed:', profile);
  }, [profile]);

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
    syncPatientData: handleSyncPatientData,
    
    // Compatibility methods
    setSex,
    setActivityLevel,
    setObjective
  };
};

export default useCalculatorState;
