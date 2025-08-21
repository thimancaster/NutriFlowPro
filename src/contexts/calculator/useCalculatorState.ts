
import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { CalculatorState } from './types';
import { useToast } from '@/hooks/use-toast';
import { useCalculator } from '@/hooks/useCalculator';
import {
  mapProfileToNew,
  mapProfileToLegacy,
  mapActivityLevelToNew,
  mapActivityLevelToLegacy,
  mapObjectiveToNew,
  mapObjectiveToLegacy,
  mapGenderToNew,
  mapGenderToLegacy
} from '@/utils/nutrition/typeMapping';

const initialState: CalculatorState = {
  weight: 0,
  height: 0,
  age: 0,
  sex: 'F',
  activityLevel: 'moderado',
  objective: 'manutenção',
  profile: 'eutrofico',
  bmr: null,
  tdee: null,
  protein: null,
  carbs: null,
  fats: null,
  loading: false,
  calculated: false,
  activeTab: 'basic'
};

export const useCalculatorState = () => {
  const [state, setState] = useState<CalculatorState>(initialState);
  const { toast } = useToast();
  const { 
    formData, 
    updateFormData, 
    calculate, 
    results, 
    isCalculating, 
    error,
    reset: resetCalculator 
  } = useCalculator();
  
  // Sync state with unified calculator
  useEffect(() => {
    setState(prev => ({
      ...prev,
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      sex: mapGenderToLegacy(formData.gender),
      activityLevel: mapActivityLevelToLegacy(formData.activityLevel),
      objective: mapObjectiveToLegacy(formData.objective),
      profile: mapProfileToLegacy(formData.profile),
      loading: isCalculating
    }));
  }, [formData, isCalculating]);

  // Sync results
  useEffect(() => {
    if (results) {
      setState(prev => ({
        ...prev,
        bmr: Math.round(results.tmb.value), // Extract numeric value
        tdee: Math.round(results.vet),
        protein: Math.round(results.macros.protein.grams),
        carbs: Math.round(results.macros.carbs.grams),
        fats: Math.round(results.macros.fat.grams),
        calculated: true,
        loading: false,
        activeTab: 'results'
      }));

      toast({
        title: "Cálculo Realizado",
        description: `Necessidades nutricionais calculadas: TMB ${results.tmb.value} kcal, VET ${results.vet} kcal`,
      });
    }
  }, [results, toast]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro no Cálculo",
        description: error,
        variant: "destructive"
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [error, toast]);
  
  const setWeight = (weight: number) => {
    updateFormData({ weight });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setHeight = (height: number) => {
    updateFormData({ height });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setAge = (age: number) => {
    updateFormData({ age });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setSex = (sex: 'M' | 'F') => {
    updateFormData({ gender: mapGenderToNew(sex) });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setActivityLevel = (activityLevel: string) => {
    updateFormData({ activityLevel: mapActivityLevelToNew(activityLevel as any) });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setObjective = (objective: string) => {
    updateFormData({ objective: mapObjectiveToNew(objective as any) });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setProfile = (profile: Profile) => {
    updateFormData({ profile: mapProfileToNew(profile) });
    setState(prev => ({ ...prev, calculated: false }));
  };
  
  const setActiveTab = (activeTab: 'basic' | 'advanced' | 'results') => {
    setState(prev => ({ ...prev, activeTab }));
  };
  
  const calculateNutrition = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Basic validation
      if (formData.weight <= 0 || formData.height <= 0 || formData.age <= 0) {
        toast({
          title: "Dados Inválidos",
          description: "Todos os valores devem ser maiores que zero",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      
      await calculate();
      
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Erro no Cálculo",
        description: "Ocorreu um erro ao calcular os valores nutricionais",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  const resetCalculatorState = () => {
    resetCalculator();
    setState(initialState);
    // Clear localStorage
    localStorage.removeItem('calculatorState');
    localStorage.removeItem('calculatorFormState');
    localStorage.removeItem('calculatorResults');
  };
  
  return {
    state,
    setWeight,
    setHeight,
    setAge,
    setSex,
    setActivityLevel,
    setObjective,
    setProfile,
    calculateNutrition,
    resetCalculator: resetCalculatorState,
    setActiveTab
  };
};
