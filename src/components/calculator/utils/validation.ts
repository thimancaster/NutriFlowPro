
/**
 * Check if all required input fields have values
 */
export function validateRequiredFields(data: {
  patientName?: string;
  age?: string;
  weight?: string | number;
  height?: string | number;
}): boolean {
  return !!(data.patientName && data.age && data.weight && data.height);
}

/**
 * Check if macro distribution percentages add up to 100%
 */
export function validateMacroPercentages(
  carbs: string,
  protein: string,
  fat: string
): boolean {
  const carbsNum = parseInt(carbs) || 0;
  const proteinNum = parseInt(protein) || 0;
  const fatNum = parseInt(fat) || 0;
  
  const total = carbsNum + proteinNum + fatNum;
  
  // Allow for small rounding errors (within 1%)
  return Math.abs(total - 100) < 1;
}

/**
 * Validate the state of the calculator
 */
export function validateCalculatorState(state: any): { 
  isValid: boolean; 
  error?: string 
} {
  if (!validateRequiredFields(state)) {
    return { 
      isValid: false, 
      error: "Preencha todos os campos obrigatórios: nome, idade, peso e altura." 
    };
  }

  if (!validateMacroPercentages(
    state.carbsPercentage, 
    state.proteinPercentage, 
    state.fatPercentage
  )) {
    return { 
      isValid: false, 
      error: "A soma dos percentuais de macronutrientes deve ser igual a 100%." 
    };
  }

  return { isValid: true };
}

/**
 * Validate numeric input value
 */
export function validateNumericInput(value: string): boolean {
  // Allow empty string or valid numbers (including decimals)
  return value === '' || /^\d*\.?\d*$/.test(value);
}

/**
 * Validate percentage input (0-100)
 */
export function validatePercentageInput(value: string): boolean {
  const num = parseFloat(value);
  return value === '' || (!isNaN(num) && num >= 0 && num <= 100);
}
