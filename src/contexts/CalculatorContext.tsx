import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';
import { stringToProfile } from '@/components/calculator/utils/profileUtils';

interface CalculatorState {
  // Basic data
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  
  // Advanced settings
  activityLevel: string;
  objective: string;
  profile: Profile;
  
  // Results
  bmr: number | null;
  tdee: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  
  // UI States
  loading: boolean;
  calculated: boolean;
  activeTab: 'basic' | 'advanced' | 'results';
}

interface CalculatorContextType {
  state: CalculatorState;
  setWeight: (weight: number) => void;
  setHeight: (height: number) => void;
  setAge: (age: number) => void;
  setSex: (sex: 'M' | 'F') => void;
  setActivityLevel: (level: string) => void;
  setObjective: (objective: string) => void;
  setProfile: (profile: Profile) => void;
  calculateNutrition: () => void;
  resetCalculator: () => void;
  setActiveTab: (tab: 'basic' | 'advanced' | 'results') => void;
}

const initialState: CalculatorState = {
  weight: 70,
  height: 170,
  age: 30,
  sex: 'M',
  activityLevel: 'moderado',
  objective: 'manutenção',
  profile: 'normal',
  bmr: null,
  tdee: null,
  protein: null,
  carbs: null,
  fats: null,
  loading: false,
  calculated: false,
  activeTab: 'basic'
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    setState(prev => ({ ...prev, weight }));
  };
  
  const setHeight = (height: number) => {
    setState(prev => ({ ...prev, height }));
  };
  
  const setAge = (age: number) => {
    setState(prev => ({ ...prev, age }));
  };
  
  const setSex = (sex: 'M' | 'F') => {
    setState(prev => ({ ...prev, sex }));
  };
  
  const setActivityLevel = (activityLevel: string) => {
    setState(prev => ({ ...prev, activityLevel }));
  };
  
  const setObjective = (objective: string) => {
    setState(prev => ({ ...prev, objective }));
  };
  
  const setProfile = (profile: Profile) => {
    setState(prev => ({ ...prev, profile }));
  };
  
  const setActiveTab = (activeTab: 'basic' | 'advanced' | 'results') => {
    setState(prev => ({ ...prev, activeTab }));
  };
  
  const calculateNutrition = () => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulating calculation delay for UI purposes
    setTimeout(() => {
      try {
        // Basic validation
        if (state.weight <= 0 || state.height <= 0 || state.age <= 0) {
          toast({
            title: "Invalid Input",
            description: "All values must be greater than zero",
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
        
        // Calculate macros based on profile
        let protein = 0;
        let fats = 0;
        // Use stringToProfile to safely handle legacy profile values
        const safeProfile = stringToProfile(state.profile);
        
        switch (safeProfile) {
          case 'magro':
            protein = state.weight * 2.0;
            fats = state.weight * 1.0;
            break;
          case 'normal':
            protein = state.weight * 1.8;
            fats = state.weight * 0.8;
            break;
          case 'sobrepeso':
            protein = state.weight * 1.6;
            fats = state.weight * 0.7;
            break;
          case 'obeso':
            protein = state.weight * 1.4;
            fats = state.weight * 0.6;
            break;
          case 'atleta':
            protein = state.weight * 2.2;
            fats = state.weight * 1.0;
            break;
        }
        
        // Calculate protein and fat calories
        const proteinCals = protein * 4;
        const fatCals = fats * 9;
        
        // Calculate remaining calories for carbs
        const remainingCals = adjustedTdee - proteinCals - fatCals;
        const carbs = Math.max(0, remainingCals / 4); // Carbs are 4 cals per gram
        
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
        
      } catch (error) {
        console.error('Calculation error:', error);
        toast({
          title: "Calculation Error",
          description: "An error occurred while calculating nutrition values",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 800);
  };
  
  const resetCalculator = () => {
    setState(initialState);
  };
  
  return (
    <CalculatorContext.Provider
      value={{
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
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
