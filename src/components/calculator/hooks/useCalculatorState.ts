import { useState, useEffect } from 'react';
import { Profile, ActivityLevel, Objective } from '@/types/consultation';
import { useToast } from '@/components/ui/use-toast';
import { useCalculator } from '@/hooks/useCalculator';

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
    hasActivePatient,
    activePatient
  } = useCalculator();

  // State for cache information
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean;
    cacheAge?: number;
  }>({
    fromCache: false
  });

  const [showResults, setShowResults] = useState(false);

  // Derived values from formData
  const weight = formData.weight.toString();
  const height = formData.height.toString();
  const age = formData.age.toString();
  const sex = formData.sex;
  const activityLevel = formData.activityLevel;
  const objective = formData.objective;
  const profile = formData.profile;
  const patientName = activePatient?.name || '';

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
      case 'sex':
        updates.sex = value;
        break;
      case 'activityLevel':
        updates.activityLevel = value as ActivityLevel;
        break;
      case 'objective':
        updates.objective = value as Objective;
        break;
      case 'profile':
        updates.profile = value as Profile;
        break;
    }
    
    updateFormData(updates);
  };

  const handleProfileChange = (value: string) => {
    updateFormData({ profile: value as Profile });
  };

  const handleCalculateWrapper = async () => {
    console.log('=== INICIANDO CÁLCULO ===');
    console.log('Dados do formulário:', formData);

    setCacheInfo({ fromCache: false });

    const calculationParams = {
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      sex: formData.sex,
      activityLevel: formData.activityLevel as ActivityLevel,
      objective: formData.objective as Objective,
      profile: formData.profile as Profile
    };

    // Use the unified calculator
    const nutritionResults = await calculate(calculationParams);
    
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

  const syncPatientData = (patient: any, currentData: any, handleInputChange: (name: string, value: any) => void) => {
    if (patient) {
      const calculatedAge = patient.birth_date 
        ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear()
        : patient.age || 0;

      handleInputChange('age', calculatedAge);
      handleInputChange('sex', patient.gender === 'male' ? 'M' : 'F');
    }
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
    
    // Results - convert unified results to legacy format
    tmbValue: results?.tmb || null,
    teeObject: results ? {
      tmb: results.tmb,
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
    setSex: (sex: 'M' | 'F') => handleInputChange('sex', sex),
    setActivityLevel: (level: string) => handleInputChange('activityLevel', level),
    setObjective: (objective: string) => handleInputChange('objective', objective)
  };
};

export default useCalculatorState;
