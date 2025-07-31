
/**
 * Nutrition Workflow Context
 * Global state management for the 3-step calculation workflow
 */
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { calculateCompleteWorkflow } from '@/utils/calculations';

// Types
interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'M' | 'F';
  profileType: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
}

interface EnergyCalculation {
  tmb: number;
  get: number;
  vet: number;
  activityFactor: number;
  objectiveType: 'hipertrofia' | 'emagrecimento' | 'manutencao';
  calorieAdjustment: number;
}

interface MacroDefinition {
  proteinPerKg: number;
  lipidPerKg: number;
  calculatedMacros: any;
  mealPercentages: number[];
  mealDistribution: any[];
}

interface MealPlan {
  meals: any[];
  totalNutrition: any;
}

interface WorkflowState {
  currentStep: 1 | 2 | 3;
  profile: UserProfile | null;
  energyCalculation: EnergyCalculation | null;
  macroDefinition: MacroDefinition | null;
  mealPlan: MealPlan | null;
  isLoading: boolean;
  errors: string[];
}

// Actions
type WorkflowAction = 
  | { type: 'SET_CURRENT_STEP'; payload: 1 | 2 | 3 }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'CALCULATE_ENERGY'; payload: { activityFactor: number; objectiveType: string; calorieAdjustment: number } }
  | { type: 'DEFINE_MACROS'; payload: { proteinPerKg: number; lipidPerKg: number; mealPercentages?: number[] } }
  | { type: 'UPDATE_MEAL_PLAN'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: string[] }
  | { type: 'RESET_WORKFLOW' };

// Initial state
const initialState: WorkflowState = {
  currentStep: 1,
  profile: null,
  energyCalculation: null,
  macroDefinition: null,
  mealPlan: null,
  isLoading: false,
  errors: []
};

// Reducer
function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    
    case 'CALCULATE_ENERGY':
      if (!state.profile) {
        return { ...state, errors: ['Perfil do usuário é obrigatório'] };
      }
      
      try {
        const result = calculateCompleteWorkflow({
          ...state.profile,
          gender: state.profile.gender,
          profile: state.profile.profileType,
          ...action.payload
        });

        if (result.isValid) {
          return {
            ...state,
            energyCalculation: {
              ...result.energyCalculation,
              objectiveType: action.payload.objectiveType as any,
              calorieAdjustment: action.payload.calorieAdjustment
            },
            errors: []
          };
        } else {
          return { ...state, errors: result.errors };
        }
      } catch (error) {
        return { ...state, errors: [error instanceof Error ? error.message : 'Erro no cálculo energético'] };
      }
    
    case 'DEFINE_MACROS':
      if (!state.profile || !state.energyCalculation) {
        return { ...state, errors: ['Cálculo energético é obrigatório'] };
      }

      try {
        const result = calculateCompleteWorkflow({
          ...state.profile,
          gender: state.profile.gender,
          profile: state.profile.profileType,
          activityFactor: state.energyCalculation.activityFactor,
          objectiveType: state.energyCalculation.objectiveType,
          calorieAdjustment: state.energyCalculation.calorieAdjustment,
          ...action.payload
        });

        if (result.isValid) {
          return {
            ...state,
            macroDefinition: {
              proteinPerKg: action.payload.proteinPerKg,
              lipidPerKg: action.payload.lipidPerKg,
              calculatedMacros: result.macronutrients,
              mealPercentages: action.payload.mealPercentages || [],
              mealDistribution: result.mealDistribution || []
            },
            errors: []
          };
        } else {
          return { ...state, errors: result.errors };
        }
      } catch (error) {
        return { ...state, errors: [error instanceof Error ? error.message : 'Erro no cálculo de macros'] };
      }
    
    case 'UPDATE_MEAL_PLAN':
      return {
        ...state,
        mealPlan: {
          meals: action.payload,
          totalNutrition: null // Will be calculated from meals
        }
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    
    case 'RESET_WORKFLOW':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const NutritionWorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
} | null>(null);

// Provider
export const NutritionWorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  return (
    <NutritionWorkflowContext.Provider value={{ state, dispatch }}>
      {children}
    </NutritionWorkflowContext.Provider>
  );
};

// Custom hook
export const useNutritionWorkflow = () => {
  const context = useContext(NutritionWorkflowContext);
  if (!context) {
    throw new Error('useNutritionWorkflow must be used within a NutritionWorkflowProvider');
  }

  const { state, dispatch } = context;

  return {
    // State
    currentStep: state.currentStep,
    profile: state.profile,
    energyCalculation: state.energyCalculation,
    macroDefinition: state.macroDefinition,
    mealPlan: state.mealPlan,
    isLoading: state.isLoading,
    errors: state.errors,
    
    // Actions
    setCurrentStep: (step: 1 | 2 | 3) => dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
    
    setProfile: (profile: UserProfile) => {
      dispatch({ type: 'SET_PROFILE', payload: profile });
    },
    
    calculateEnergy: (params: { activityFactor: number; objectiveType: string; calorieAdjustment: number }) => {
      dispatch({ type: 'CALCULATE_ENERGY', payload: params });
    },
    
    defineMacros: (params: { proteinPerKg: number; lipidPerKg: number; mealPercentages?: number[] }) => {
      dispatch({ type: 'DEFINE_MACROS', payload: params });
    },
    
    updateMealPlan: (meals: any[]) => {
      dispatch({ type: 'UPDATE_MEAL_PLAN', payload: meals });
    },
    
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setErrors: (errors: string[]) => dispatch({ type: 'SET_ERRORS', payload: errors }),
    
    resetWorkflow: () => dispatch({ type: 'RESET_WORKFLOW' }),
    
    // Computed values
    canProceedToStep2: state.profile && state.energyCalculation,
    canProceedToStep3: state.profile && state.energyCalculation && state.macroDefinition,
    isWorkflowComplete: state.profile && state.energyCalculation && state.macroDefinition && state.mealPlan
  };
};
