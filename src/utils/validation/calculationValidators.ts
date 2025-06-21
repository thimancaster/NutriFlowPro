
import { ValidationResult } from './types';

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

  // Validate age
  if (!calculationData.age || calculationData.age <= 0) {
    errors.age = 'Idade deve ser um número positivo';
  } else if (calculationData.age < 10 || calculationData.age > 100) {
    errors.age = 'Idade deve estar entre 10 e 100 anos';
  } else {
    sanitizedData.age = Number(calculationData.age);
  }

  // Validate sex
  if (!calculationData.sex || !['M', 'F'].includes(calculationData.sex)) {
    errors.sex = 'Sexo deve ser M ou F';
  } else {
    sanitizedData.sex = calculationData.sex;
  }

  // Validate activity level
  const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
  if (!calculationData.activityLevel || !validActivityLevels.includes(calculationData.activityLevel)) {
    errors.activityLevel = 'Nível de atividade inválido';
  } else {
    sanitizedData.activityLevel = calculationData.activityLevel;
  }

  // Validate objective
  const validObjectives = ['emagrecimento', 'manutenção', 'hipertrofia', 'personalizado'];
  if (!calculationData.objective || !validObjectives.includes(calculationData.objective)) {
    errors.objective = 'Objetivo inválido';
  } else {
    sanitizedData.objective = calculationData.objective;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};
