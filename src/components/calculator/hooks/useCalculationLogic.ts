import { useState } from 'react';
import { CalculatorState } from '@/components/calculator/types';
import { useToast } from '@/hooks/use-toast';

// Type for calculation results
export interface CalculationResults {
  bmr: number | null;
  tee: number | null;
  macros: { carbs: number; protein: number; fat: number } | null;
}

// Hook for handling calculation logic
export const useCalculationLogic = (calculatorState: CalculatorState) => {
  // State for calculation results
  const [results, setResults] = useState<CalculationResults>({
    bmr: null,
    tee: null, 
    macros: null
  });
  
  const { toast } = useToast();

  // Calculate BMR (Basal Metabolic Rate)
  const calculateBMR = (state: CalculatorState): number => {
    const { weight, height, age, gender } = state;
    
    // Convert inputs to numbers
    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);
    
    // Use the Harris-Benedict equation
    if (gender === 'male') {
      return 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
    } else {
      return 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
    }
  };
  
  // Calculate TEE (Total Energy Expenditure)
  const calculateTEE = (bmr: number, activityLevel: string): number => {
    // Activity factor mapping based on activity level
    const activityFactors: { [key: string]: number } = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      alto: 1.725,
      extremo: 1.9
    };
    
    const factor = activityFactors[activityLevel] || 1.2; // Default to sedentary if not found
    
    return bmr * factor;
  };

  // Calculate macros based on objective
  const calculateMacrosByObjective = (
    objective: string,
    tee: number,
    weight: number,
    lowCarbOption: boolean = false,
    gender: string = 'female'
  ): { carbs: number; protein: number; fat: number } => {
    // Default macro distribution (carbs/protein/fat percentages)
    let carbsPercent = 0.50;
    let proteinPercent = 0.25;
    let fatPercent = 0.25;
    
    // Adjust based on objective
    switch (objective) {
      case 'emagrecimento':
        carbsPercent = lowCarbOption ? 0.25 : 0.40;
        proteinPercent = 0.35;
        fatPercent = lowCarbOption ? 0.40 : 0.25;
        // Apply a caloric deficit
        tee = tee * 0.85;
        break;
      case 'hipertrofia':
        carbsPercent = 0.50;
        proteinPercent = 0.30;
        fatPercent = 0.20;
        // Apply a caloric surplus
        tee = tee * 1.10;
        break;
      case 'manutenção':
      default:
        // Keep default distribution
        break;
    }
    
    // Calculate grams of each macronutrient
    const proteinGrams = Math.round((tee * proteinPercent) / 4); // 4 calories per gram
    const carbsGrams = Math.round((tee * carbsPercent) / 4); // 4 calories per gram
    const fatGrams = Math.round((tee * fatPercent) / 9); // 9 calories per gram
    
    return {
      carbs: carbsGrams,
      protein: proteinGrams,
      fat: fatGrams
    };
  };

  // Validate inputs for calculation
  const validateInputsForCalculation = (state: CalculatorState): string | null => {
    if (!state.weight || !state.height || !state.age) {
      return "Preencha todos os campos obrigatórios: peso, altura e idade.";
    }
    
    const weight = parseFloat(state.weight);
    const height = parseFloat(state.height);
    const age = parseFloat(state.age);
    
    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
      return "Os valores numéricos são inválidos.";
    }
    
    if (weight <= 0 || weight > 300) {
      return "Peso deve estar entre 1 e 300 kg.";
    }
    
    if (height <= 0 || height > 250) {
      return "Altura deve estar entre 1 e 250 cm.";
    }
    
    if (age <= 0 || age > 120) {
      return "Idade deve estar entre 1 e 120 anos.";
    }
    
    return null;
  };

  // Perform all calculations
  const performCalculations = (): CalculationResults => {
    // Validate inputs first
    const validationError = validateInputsForCalculation(calculatorState);
    if (validationError) {
      toast({
        title: "Dados incompletos",
        description: validationError,
        variant: "destructive"
      });
      return { bmr: null, tee: null, macros: null };
    }
    
    try {
      // Calculate BMR
      const bmr = calculateBMR(calculatorState);
      
      // Calculate TEE based on activity level
      const tee = calculateTEE(bmr, calculatorState.activityLevel);
      
      // Calculate macros based on objective and TEE
      const macros = calculateMacrosByObjective(
        calculatorState.objective,
        tee,
        Number(calculatorState.weight),
        calculatorState.lowCarbOption || false,
        calculatorState.gender
      );
      
      return { bmr, tee, macros };
    } catch (error) {
      console.error("Error in calculation:", error);
      toast({
        title: "Erro de cálculo",
        description: "Ocorreu um erro ao realizar os cálculos. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      return { bmr: null, tee: null, macros: null };
    }
  };
  
  // Function to trigger calculations and update state
  const calculateResults = () => {
    const newResults = performCalculations();
    setResults(newResults);
    return newResults;
  };
  
  // Check if the form has errors
  const hasErrors = (): boolean => {
    const requiredFields = ['weight', 'height', 'age'];
    
    for (const field of requiredFields) {
      if (!calculatorState[field]) {
        toast({
          title: "Dados incompletos",
          description: `Por favor, preencha o campo ${field}.`,
          variant: "destructive"
        });
        return true;
      }
    }
    
    return false;
  };
  
  return {
    results,
    calculateResults,
    hasErrors
  };
};
