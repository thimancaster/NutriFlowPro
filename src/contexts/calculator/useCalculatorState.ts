
import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { CalculatorState } from './types';
import { useToast } from '@/hooks/use-toast';
import { stringToProfile } from '@/components/calculator/utils/profileUtils';

const initialState: CalculatorState = {
  weight: 70,
  height: 170,
  age: 30,
  sex: 'M',
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
  
  // Load saved calculator state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('calculatorState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Ensure profile is valid
        if (parsedState.profile) {
          parsedState.profile = stringToProfile(parsedState.profile);
        }
        setState(prevState => ({ ...prevState, ...parsedState }));
      }
    } catch (error) {
      console.error('Failed to load calculator state:', error);
    }
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      const stateToSave = {
        weight: state.weight,
        height: state.height,
        age: state.age,
        sex: state.sex,
        activityLevel: state.activityLevel,
        objective: state.objective,
        profile: state.profile
      };
      localStorage.setItem('calculatorState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save calculator state:', error);
    }
  }, [state.weight, state.height, state.age, state.sex, state.activityLevel, state.objective, state.profile]);
  
  const setWeight = (weight: number) => {
    setState(prev => ({ ...prev, weight, calculated: false }));
  };
  
  const setHeight = (height: number) => {
    setState(prev => ({ ...prev, height, calculated: false }));
  };
  
  const setAge = (age: number) => {
    setState(prev => ({ ...prev, age, calculated: false }));
  };
  
  const setSex = (sex: 'M' | 'F') => {
    setState(prev => ({ ...prev, sex, calculated: false }));
  };
  
  const setActivityLevel = (activityLevel: string) => {
    setState(prev => ({ ...prev, activityLevel, calculated: false }));
  };
  
  const setObjective = (objective: string) => {
    setState(prev => ({ ...prev, objective, calculated: false }));
  };
  
  const setProfile = (profile: Profile) => {
    console.log('Setting profile to:', profile);
    setState(prev => ({ ...prev, profile, calculated: false }));
  };
  
  const setActiveTab = (activeTab: 'basic' | 'advanced' | 'results') => {
    setState(prev => ({ ...prev, activeTab }));
  };
  
  const calculateNutrition = () => {
    setState(prev => ({ ...prev, loading: true }));
    
    console.log('Calculating nutrition with profile:', state.profile);
    
    // Simulating calculation delay for UI purposes
    setTimeout(() => {
      try {
        // Basic validation
        if (state.weight <= 0 || state.height <= 0 || state.age <= 0) {
          toast({
            title: "Dados Inválidos",
            description: "Todos os valores devem ser maiores que zero",
            variant: "destructive"
          });
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        // Calculate BMR using Mifflin-St Jeor Equation
        let bmr: number;
        if (state.sex === 'M') {
          bmr = (10 * state.weight) + (6.25 * state.height) - (5 * state.age) + 5;
        } else {
          bmr = (10 * state.weight) + (6.25 * state.height) - (5 * state.age) - 161;
        }
        
        // Calculate TDEE based on activity level
        let activityFactor = 1.2; // Sedentary default
        switch (state.activityLevel) {
          case 'sedentario':
            activityFactor = 1.2;
            break;
          case 'leve':
            activityFactor = 1.375;
            break;
          case 'moderado':
            activityFactor = 1.55;
            break;
          case 'intenso':
            activityFactor = 1.725;
            break;
          case 'muito_intenso':
            activityFactor = 1.9;
            break;
        }
        const tdee = bmr * activityFactor;
        
        // Adjust for objective
        let adjustedTdee = tdee;
        switch (state.objective) {
          case 'emagrecimento':
            adjustedTdee = tdee * 0.8; // 20% deficit
            break;
          case 'hipertrofia':
            adjustedTdee = tdee * 1.15; // 15% surplus
            break;
        }
        
        // Calculate macros based on profile - CORRIGIDO
        let protein = 0;
        let fats = 0;
        
        console.log('Using profile for macro calculation:', state.profile);
        
        switch (state.profile) {
          case 'eutrofico':
            protein = state.weight * 1.4;
            fats = state.weight * 1.0;
            break;
          case 'sobrepeso_obesidade':
            protein = state.weight * 1.8;
            fats = state.weight * 0.8;
            break;
          case 'atleta':
            protein = state.weight * 2.0;
            fats = state.weight * 1.2;
            break;
          default:
            // Fallback to eutrofico
            protein = state.weight * 1.4;
            fats = state.weight * 1.0;
            console.warn('Unknown profile, using eutrofico defaults');
        }
        
        // Calculate protein and fat calories
        const proteinCals = protein * 4;
        const fatCals = fats * 9;
        
        // Calculate remaining calories for carbs
        const remainingCals = adjustedTdee - proteinCals - fatCals;
        const carbs = Math.max(0, remainingCals / 4); // Carbs are 4 cals per gram
        
        console.log('Calculation results:', {
          bmr: Math.round(bmr),
          tdee: Math.round(adjustedTdee),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fats: Math.round(fats),
          profile: state.profile
        });
        
        setState(prev => ({
          ...prev,
          bmr: Math.round(bmr),
          tdee: Math.round(adjustedTdee),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fats: Math.round(fats),
          loading: false,
          calculated: true,
          activeTab: 'results'
        }));
        
        toast({
          title: "Cálculo Realizado",
          description: "Necessidades nutricionais calculadas com sucesso!",
        });
        
      } catch (error) {
        console.error('Calculation error:', error);
        toast({
          title: "Erro no Cálculo",
          description: "Ocorreu um erro ao calcular os valores nutricionais",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 800);
  };
  
  const resetCalculator = () => {
    setState(initialState);
    localStorage.removeItem('calculatorState');
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
    resetCalculator,
    setActiveTab
  };
};
