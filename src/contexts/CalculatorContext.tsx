
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Definir os tipos para o estado da calculadora
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
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  bmr: number | null;
  tee: { get: number; adjustment: number; vet: number } | null;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
    proteinPerKg: number;
  } | null;
  isCalculating: boolean;
  errorMessage: string | null;
};

// Definir as ações do reducer
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
  | { type: 'SET_CARBS_PERCENTAGE'; payload: string }
  | { type: 'SET_PROTEIN_PERCENTAGE'; payload: string }
  | { type: 'SET_FAT_PERCENTAGE'; payload: string }
  | { type: 'SET_BMR'; payload: number }
  | { type: 'SET_TEE'; payload: { get: number; adjustment: number; vet: number } }
  | { type: 'SET_MACROS'; payload: { carbs: number; protein: number; fat: number; proteinPerKg: number } }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Estado inicial
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
  carbsPercentage: '50',
  proteinPercentage: '25',
  fatPercentage: '25',
  bmr: null,
  tee: null,
  macros: null,
  isCalculating: false,
  errorMessage: null
};

// Função reducer
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

// Criar o contexto
type CalculatorContextType = {
  calculatorState: CalculatorState;
  calculatorDispatch: React.Dispatch<CalculatorAction>;
  calculateNutritionalNeeds: () => void;
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

// Provider
export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calculatorState, calculatorDispatch] = useReducer(calculatorReducer, initialState);

  // Função para calcular as necessidades nutricionais
  const calculateNutritionalNeeds = () => {
    try {
      calculatorDispatch({ type: 'SET_CALCULATING', payload: true });
      calculatorDispatch({ type: 'SET_ERROR', payload: null });

      const { weight, height, age, gender, activityLevel, objective } = calculatorState;

      if (!weight || !height || !age) {
        throw new Error('Preencha os dados de peso, altura e idade para calcular.');
      }

      // Calcular TMB usando a fórmula de Mifflin-St Jeor
      const weightNum = Number(weight);
      const heightNum = Number(height);
      const ageNum = Number(age);

      let bmr;
      if (gender === 'male') {
        bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5;
      } else {
        bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161;
      }

      // Arredondar a TMB para o número inteiro mais próximo
      bmr = Math.round(bmr);
      calculatorDispatch({ type: 'SET_BMR', payload: bmr });

      // Calcular fator de atividade
      let activityFactor = 1.2; // Valor padrão sedentário
      
      switch (activityLevel) {
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
        default:
          activityFactor = 1.55; // Padrão moderado
      }

      // Calcular GET (Gasto Energético Total)
      const get = Math.round(bmr * activityFactor);

      // Calcular ajuste baseado no objetivo
      let adjustment = 0;
      switch (objective) {
        case 'emagrecimento':
          adjustment = -500;
          break;
        case 'hipertrofia':
          adjustment = 300;
          break;
        case 'manutenção':
        default:
          adjustment = 0;
      }

      // Calcular VET (Valor Energético Total)
      const vet = get + adjustment;

      // Salvar TEE
      calculatorDispatch({ 
        type: 'SET_TEE', 
        payload: { get, adjustment, vet } 
      });

      // Calcular macronutrientes
      const carbsPercent = parseInt(calculatorState.carbsPercentage) / 100;
      const proteinPercent = parseInt(calculatorState.proteinPercentage) / 100;
      const fatPercent = parseInt(calculatorState.fatPercentage) / 100;

      const totalPercent = carbsPercent + proteinPercent + fatPercent;
      if (Math.abs(totalPercent - 1) > 0.01) { // Permitir pequenas diferenças de arredondamento
        throw new Error('Os percentuais de macronutrientes devem somar 100%');
      }

      const carbs = Math.round((vet * carbsPercent) / 4); // 4kcal por grama de carboidrato
      const protein = Math.round((vet * proteinPercent) / 4); // 4kcal por grama de proteína
      const fat = Math.round((vet * fatPercent) / 9); // 9kcal por grama de gordura

      // Calcular proteína por kg
      const proteinPerKg = parseFloat((protein / weightNum).toFixed(2));

      // Salvar macros
      calculatorDispatch({
        type: 'SET_MACROS',
        payload: { carbs, protein, fat, proteinPerKg }
      });

      // Mostrar toast de sucesso
      toast({
        title: 'Cálculo realizado com sucesso',
        description: `VET: ${vet} kcal | Proteína: ${protein}g | Carbs: ${carbs}g | Gorduras: ${fat}g`,
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

// Hook para usar o contexto
export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
