
import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';
import { calculateCompleteNutrition } from '@/utils/nutritionCalculations';

interface CalculatorState {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: Profile;
  bmr: number | null;
  tdee: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  loading: boolean;
  calculated: boolean;
  activeTab: 'basic' | 'advanced' | 'results';
  formulaUsed?: string;
  proteinPerKg?: number;
}

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
    
    console.log('Calculating nutrition with corrected formulas:', {
      profile: state.profile,
      weight: state.weight,
      height: state.height,
      age: state.age,
      sex: state.sex,
      activityLevel: state.activityLevel,
      objective: state.objective
    });
    
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
        
        // Use the new corrected calculation function
        const results = calculateCompleteNutrition(
          state.weight,
          state.height,
          state.age,
          state.sex,
          state.activityLevel as any,
          state.objective as any,
          state.profile
        );
        
        console.log('Calculation results with corrected formulas:', results);
        
        setState(prev => ({
          ...prev,
          bmr: results.tmb,
          tdee: results.vet, // Using VET as the final caloric target
          protein: results.macros.protein.grams,
          carbs: results.macros.carbs.grams,
          fats: results.macros.fat.grams,
          formulaUsed: results.formulaUsed,
          proteinPerKg: results.macros.proteinPerKg,
          loading: false,
          calculated: true,
          activeTab: 'results'
        }));
        
        toast({
          title: "Cálculo Realizado",
          description: `Necessidades nutricionais calculadas usando ${results.formulaUsed}`,
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
