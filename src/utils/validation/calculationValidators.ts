import { ValidationResult } from './types';

/**
 * Validates calculation data before saving to database
 */
export const validateCalculation = (calculationData: any): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitizedData: any = {};

  // Validate weight
  if (!calculationData.weight || calculationData.weight <= 0) {
    errors.weight = 'Peso deve ser um número positivo';
  } else if (calculationData.weight < 20 || calculationData.weight > 300) {
    errors.weight = 'Peso deve estar entre 20kg e 300kg';
  } else {
    sanitizedData.weight = Number(calculationData.weight);
  }

  // Validate height
  if (!calculationData.height || calculationData.height <= 0) {
    errors.height = 'Altura deve ser um número positivo';
  } else if (calculationData.height < 100 || calculationData.height > 250) {
    errors.height = 'Altura deve estar entre 100cm e 250cm';
  } else {
    sanitizedData.height = Number(calculationData.height);
  }

  // Validate age - Handle undefined, null, and 0
  const age = calculationData.age;
  if (age === undefined || age === null || Number(age) <= 0) {
    console.warn('[VALIDATION] Invalid age:', age);
    errors.age = 'Idade inválida. Por favor, forneça uma idade válida (maior que 0).';
  } else if (Number(age) < 10 || Number(age) > 120) {
    errors.age = 'Idade deve estar entre 10 e 120 anos';
  } else {
    sanitizedData.age = Number(age);
  }

  // Validate sex/gender
  const gender = calculationData.gender || calculationData.sex;
  const validGenders = ['M', 'F', 'male', 'female', 'masculino', 'feminino'];
  if (!gender || !validGenders.includes(gender)) {
    errors.gender = 'Sexo deve ser informado (M ou F)';
  } else {
    // Normalize to M/F
    sanitizedData.gender = gender.toLowerCase().startsWith('m') ? 'M' : 'F';
  }

  // Validate activity level
  const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso', 'sedentary', 'light', 'moderate', 'active', 'very_active'];
  if (calculationData.activity_level && !validActivityLevels.includes(calculationData.activity_level)) {
    errors.activity_level = 'Nível de atividade inválido';
  } else {
    sanitizedData.activity_level = calculationData.activity_level || 'moderado';
  }

  // Validate objective/goal
  const validGoals = ['emagrecimento', 'manutenção', 'manutencao', 'hipertrofia', 'personalizado', 'weight_loss', 'maintenance', 'muscle_gain'];
  if (calculationData.goal && !validGoals.includes(calculationData.goal)) {
    errors.goal = 'Objetivo inválido';
  } else {
    sanitizedData.goal = calculationData.goal || 'manutenção';
  }

  // Validate numeric values (bmr, tdee, macros)
  const extractNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && 'value' in val) return Number(val.value) || 0;
    return Number(val) || 0;
  };

  sanitizedData.bmr = extractNumericValue(calculationData.bmr);
  sanitizedData.tdee = extractNumericValue(calculationData.tdee);
  sanitizedData.protein = extractNumericValue(calculationData.protein);
  sanitizedData.carbs = extractNumericValue(calculationData.carbs);
  sanitizedData.fats = extractNumericValue(calculationData.fats);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

/**
 * Legacy function name for backward compatibility
 */
export const validateCalculationInputs = validateCalculation;

/**
 * Quick age validation helper
 */
export const isValidAge = (age: any): boolean => {
  if (age === undefined || age === null) return false;
  const numAge = Number(age);
  return !isNaN(numAge) && numAge > 0 && numAge <= 120;
};
