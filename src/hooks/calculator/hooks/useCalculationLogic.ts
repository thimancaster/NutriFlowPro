
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
    let proteinPercent = 0.20;
    let fatPercent = 0.30;

    // Adjust based on objective
    switch (objective) {
      case 'emagrecimento':
        carbsPercent = lowCarbOption ? 0.30 : 0.45;
        proteinPercent = 0.30;
        fatPercent = lowCarbOption ? 0.40 : 0.25;
        break;
      case 'hipertrofia':
        carbsPercent = 0.55;
        proteinPercent = 0.25;
        fatPercent = 0.20;
        break;
      case 'manutencao':
      default:
        carbsPercent = 0.50;
        proteinPercent = 0.20;
        fatPercent = 0.30;
        break;
    }

    // Calculate macro calories
    const carbsCalories = tee * carbsPercent;
    const proteinCalories = tee * proteinPercent;
    const fatCalories = tee * fatPercent;

    // Convert to grams (4 kcal/g for carbs and protein, 9 kcal/g for fat)
    const carbsGrams = Math.round(carbsCalories / 4);
    const proteinGrams = Math.round(proteinCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    return {
      carbs: carbsGrams,
      protein: proteinGrams,
      fat: fatGrams
    };
  };

  // Main calculation function
  const performCalculation = () => {
    try {
      // Validate inputs
      if (!calculatorState.weight || !calculatorState.height || !calculatorState.age) {
        toast({
          title: "Dados incompletos",
          description: "Preencha peso, altura e idade para realizar o cálculo.",
          variant: "destructive"
        });
        return null;
      }

      const weight = Number(calculatorState.weight);
      const height = Number(calculatorState.height);
      const age = Number(calculatorState.age);

      if (weight <= 0 || height <= 0 || age <= 0) {
        toast({
          title: "Valores inválidos",
          description: "Peso, altura e idade devem ser valores positivos.",
          variant: "destructive"
        });
        return null;
      }

      // Calculate BMR
      const bmr = calculateBMR(calculatorState);
      
      // Calculate TEE
      const tee = calculateTEE(bmr, calculatorState.activityLevel);
      
      // Calculate macros
      const macros = calculateMacrosByObjective(
        calculatorState.objective,
        tee,
        weight,
        false, // lowCarbOption - could be a state if needed
        calculatorState.gender
      );

      const calculationResults = { bmr, tee, macros };
      setResults(calculationResults);

      toast({
        title: "Cálculo realizado",
        description: `TMB: ${Math.round(bmr)} kcal | GET: ${Math.round(tee)} kcal`,
      });

      return calculationResults;
    } catch (error) {
      console.error('Erro no cálculo:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao realizar o cálculo. Verifique os dados.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    results,
    setResults,
    performCalculation,
    calculateBMR,
    calculateTEE,
    calculateMacrosByObjective
  };
};
