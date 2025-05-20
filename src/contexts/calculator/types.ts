
import { Profile } from '@/types/consultation';

export interface CalculatorState {
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

export interface CalculatorContextType {
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
