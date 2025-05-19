import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET
} from '@/utils/nutritionCalculations';
import { calculateMacrosByProfile } from '@/utils/macronutrientCalculations';
import { Profile } from '@/types/consultation';

// Define types for the calculator state
export type CalculatorState = {
  patientName: string;
  gender: 'male' | 'female';
  age: string;
  weight: number;
  height: number;
  objective: string;
  activityLevel: string;
  consultationType: string;
  profile: Profile;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  bmr: number | null;
  tee: { get: number; adjustment: number; vet: number } | null;
  macros: {
    protein: { grams: number; kcal: number; percentage: number; perKg: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number; perKg: number };
  } | null;
  isCalculating: boolean;
  errorMessage: string | null;
};

// Define the actions for the reducer
export type CalculatorAction = 
  | { type: 'SET_PATIENT_NAME'; payload: string }
  | { type: 'SET_GENDER'; payload: 'male' | 'female' }
  | { type: 'SET_AGE'; payload: string }
  | { type: 'SET_WEIGHT'; payload: string }
  | { type: 'SET_HEIGHT'; payload: string }
  | { type: 'SET_OBJECTIVE'; payload: string }
  | { type: 'SET_ACTIVITY_LEVEL'; payload: string }
  | { type: 'SET_CONSULTATION_TYPE'; payload: string }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_CARBS_PERCENTAGE'; payload: string }
  | { type: 'SET_PROTEIN_PERCENTAGE'; payload: string }
  | { type: 'SET_FAT_PERCENTAGE'; payload: string }
  | { type: 'SET_BMR'; payload: number }
  | { type: 'SET_TEE'; payload: { get: number; adjustment: number; vet: number } }
  | { type: 'SET_MACROS'; payload: { 
      protein: { grams: number; kcal: number; percentage: number; perKg: number };
      carbs: { grams: number; kcal: number; percentage: number };
      fat: { grams: number; kcal: number; percentage: number; perKg: number };
    } }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Initial state
const initialState: CalculatorState = {
  patientName: '',
  gender: 'female',
  age: '',
  weight: 0,
  height: 0,
  objective: 'manutenção',
  activityLevel: 'moderado',
  consultationType: 'primeira_consulta',
  profile: 'eutrofico',
  carbsPercentage: '',
  proteinPercentage: '',
  fatPercentage: '',
  bmr: null,
  tee: null,
  macros: null,
  isCalculating: false,
  errorMessage: null
};

// Reducer function
function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'SET_PATIENT_NAME':
      return { ...state, patientName: action.payload };
    case 'SET_GENDER':
      return { ...state, gender: action.payload };
    case 'SET_AGE':
      return { ...state, age: action.payload };
    case 'SET_WEIGHT':
      return { ...state, weight: parseFloat(action.payload) || 0 };
    case 'SET_HEIGHT':
      return { ...state, height: parseInt(action.payload) || 0 };
    case 'SET_OBJECTIVE':
      return { ...state, objective: action.payload };
    case 'SET_ACTIVITY_LEVEL':
      return { ...state, activityLevel: action.payload };
    case 'SET_CONSULTATION_TYPE':
      return { ...state, consultationType: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_CARBS_PERCENTAGE':
      return { ...state, carbsPercentage: action.payload };
    case 'SET_PROTEIN_PERCENTAGE':
      return { ...state, proteinPercentage: action.payload };
    case 'SET_FAT_PERCENTAGE':
      return { ...state, fatPercentage: action.payload };
    case 'SET_BMR':
      return { ...state, bmr: action.payload };
    case 'SET_TEE':
      return { ...state, tee: action.payload };
    case 'SET_MACROS':
      return { ...state, macros: action.payload };
    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create the context
type CalculatorContextType = {
  calculatorState: CalculatorState;
  calculatorDispatch: React.Dispatch<CalculatorAction>;
  calculateNutritionalNeeds: () => void;
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

// Provider component
export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calculatorState, calculatorDispatch] = useReducer(calculatorReducer, initialState);

  // Function to calculate nutritional needs
  const calculateNutritionalNeeds = () => {
    try {
      calculatorDispatch({ type: 'SET_CALCULATING', payload: true });
      calculatorDispatch({ type: 'SET_ERROR', payload: null });

      const { weight, height, age, gender, activityLevel, objective, profile } = calculatorState;

      if (!weight || !height || !age) {
        throw new Error('Preencha os dados de peso, altura e idade para calcular.');
      }

      // Step 1: Calculate BMR (Taxa Metabólica Basal)
      const bmr = calculateTMB(
        weight, 
        height, 
        parseInt(age), 
        gender === 'male' ? 'M' : 'F'
      );
      calculatorDispatch({ type: 'SET_BMR', payload: bmr });

      // Step 2: Calculate GET (Gasto Energético Total)
      const get = calculateGET(bmr, activityLevel);

      // Step 3: Calculate VET (Valor Energético Total - with objective adjustment)
      const vet = calculateVET(get, objective);
      
      // Calculate the adjustment value (difference between GET and VET)
      const adjustment = vet - get;

      // Save TEE (Total Energy Expenditure) data
      calculatorDispatch({ 
        type: 'SET_TEE', 
        payload: { get, adjustment, vet } 
      });

      // Step 4: Calculate macronutrients using the weight-based approach
      const macroResults = calculateMacrosByProfile(profile, weight, vet);
      
      // Save macronutrient distribution
      calculatorDispatch({
        type: 'SET_MACROS',
        payload: macroResults
      });

      // Update the percentage fields for display only (these are now derived values, not inputs)
      calculatorDispatch({ type: 'SET_PROTEIN_PERCENTAGE', payload: macroResults.protein.percentage.toString() });
      calculatorDispatch({ type: 'SET_CARBS_PERCENTAGE', payload: macroResults.carbs.percentage.toString() });
      calculatorDispatch({ type: 'SET_FAT_PERCENTAGE', payload: macroResults.fat.percentage.toString() });

      // Show toast with success message
      toast({
        title: 'Cálculo realizado com sucesso',
        description: `VET: ${vet} kcal | PTN: ${macroResults.protein.grams}g (${macroResults.protein.perKg}g/kg) | CHO: ${macroResults.carbs.grams}g | LIP: ${macroResults.fat.grams}g (${macroResults.fat.perKg}g/kg)`,
        duration: 3000,
      });

    } catch (error) {
      calculatorDispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao calcular necessidades nutricionais'
      });
      
      toast({
        title: 'Erro no cálculo',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao calcular',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      calculatorDispatch({ type: 'SET_CALCULATING', payload: false });
    }
  };

  return (
    <CalculatorContext.Provider value={{ calculatorState, calculatorDispatch, calculateNutritionalNeeds }}>
      {children}
    </CalculatorContext.Provider>
  );
};

// Hook to use the context
export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
