import { CalculatorState } from './types';

// Key for storing calculator results in storage
export const CALCULATOR_RESULTS_KEY = 'nutriflow_calculator_results';

// Get initial calculator state
export function getInitialCalculatorState(): CalculatorState {
  return {
    patientName: '',
    gender: 'female',
    age: '',
    weight: '',
    height: '',
    objective: 'manutenção',
    activityLevel: '1.2',
    carbsPercentage: '55',
    proteinPercentage: '20',
    fatPercentage: '25',
    consultationType: 'primeira_consulta'
  };
}

// Validate calculator inputs
export function validateCalculatorInputs(
  age: string, 
  weight: string, 
  height: string,
  toast: any
): boolean {
  // Basic validation for required fields
  if (!age || !weight || !height) {
    toast({
      title: "Campos obrigatórios",
      description: "Por favor, preencha todos os campos necessários.",
      variant: "destructive"
    });
    return false;
  }
  
  // Validate reasonable values
  const ageVal = parseFloat(age);
  const weightVal = parseFloat(weight);
  const heightVal = parseFloat(height);
  
  if (ageVal <= 0 || ageVal > 120) {
    toast({
      title: "Valor inválido",
      description: "A idade deve estar entre 1 e 120 anos.",
      variant: "destructive"
    });
    return false;
  }
  
  if (weightVal <= 0 || weightVal > 300) {
    toast({
      title: "Valor inválido",
      description: "O peso deve estar entre 1 e 300 kg.",
      variant: "destructive"
    });
    return false;
  }
  
  if (heightVal <= 0 || heightVal > 250) {
    toast({
      title: "Valor inválido",
      description: "A altura deve estar entre 1 e 250 cm.",
      variant: "destructive"
    });
    return false;
  }
  
  return true;
}

// Calculate BMR based on gender, weight, height and age
export function calculateBMR(
  gender: string,
  weight: string,
  height: string,
  age: string
): number {
  const weightVal = parseFloat(weight);
  const heightVal = parseFloat(height);
  const ageVal = parseFloat(age);
  
  let calculatedBmr;
  if (gender === 'male') {
    // Men: 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
    calculatedBmr = 66 + (13.7 * weightVal) + (5 * heightVal) - (6.8 * ageVal);
  } else {
    // Women: 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
    calculatedBmr = 655 + (9.6 * weightVal) + (1.8 * heightVal) - (4.7 * ageVal);
  }
  
  // Round TMB to the nearest whole number
  return Math.round(calculatedBmr);
}

// Calculate macronutrients based on TEE and distribution percentages
export function calculateMacros(
  tee: number,
  carbsPercentage: string,
  proteinPercentage: string,
  fatPercentage: string
) {
  const carbsPercent = parseFloat(carbsPercentage) / 100;
  const proteinPercent = parseFloat(proteinPercentage) / 100;
  const fatPercent = parseFloat(fatPercentage) / 100;
  
  return {
    carbs: Math.round((tee * carbsPercent) / 4), // 4 calories per gram of carbs
    protein: Math.round((tee * proteinPercent) / 4), // 4 calories per gram of protein
    fat: Math.round((tee * fatPercent) / 9), // 9 calories per gram of fat
  };
}
