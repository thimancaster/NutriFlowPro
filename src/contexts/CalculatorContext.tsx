
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the calculator state type
export type CalculatorState = {
  patientName: string;
  gender: 'male' | 'female';
  age: string;
  weight: number;
  height: number;
  objective: string;
  activityLevel: string;
  consultationType: string;
  profile: string;
  carbPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
};

// Define action types
export type CalculatorAction = 
  | { type: 'SET_PATIENT_NAME'; payload: string }
  | { type: 'SET_GENDER'; payload: 'male' | 'female' }
  | { type: 'SET_AGE'; payload: string }
  | { type: 'SET_WEIGHT'; payload: string }
  | { type: 'SET_HEIGHT'; payload: string }
  | { type: 'SET_OBJECTIVE'; payload: string }
  | { type: 'SET_ACTIVITY_LEVEL'; payload: string }
  | { type: 'SET_CONSULTATION_TYPE'; payload: string }
  | { type: 'SET_PROFILE'; payload: string }
  | { type: 'SET_CARB_PERCENTAGE'; payload: string }
  | { type: 'SET_PROTEIN_PERCENTAGE'; payload: string }
  | { type: 'SET_FAT_PERCENTAGE'; payload: string }
  | { type: 'RESET' };

// Define the context type
type CalculatorContextType = {
  calculatorState: CalculatorState;
  calculatorDispatch: React.Dispatch<CalculatorAction>;
};

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
  profile: 'magro',
  carbPercentage: '50',
  proteinPercentage: '25',
  fatPercentage: '25',
};

// Create context
const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

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
    case 'SET_CARB_PERCENTAGE':
      return { ...state, carbPercentage: action.payload };
    case 'SET_PROTEIN_PERCENTAGE':
      return { ...state, proteinPercentage: action.payload };
    case 'SET_FAT_PERCENTAGE':
      return { ...state, fatPercentage: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Provider component
export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calculatorState, calculatorDispatch] = useReducer(calculatorReducer, initialState);

  return (
    <CalculatorContext.Provider value={{ calculatorState, calculatorDispatch }}>
      {children}
    </CalculatorContext.Provider>
  );
};

// Custom hook to use the calculator context
export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
