
import { ValidationResult } from './types';

export const validateMealPlan = (mealPlanData: any): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitizedData: any = {};

  // Validate total calories
  if (!mealPlanData.totalCalories || mealPlanData.totalCalories <= 0) {
    errors.totalCalories = 'Total de calorias deve ser positivo';
  } else if (mealPlanData.totalCalories < 800 || mealPlanData.totalCalories > 5000) {
    errors.totalCalories = 'Total de calorias deve estar entre 800 e 5000';
  } else {
    sanitizedData.totalCalories = Number(mealPlanData.totalCalories);
  }

  // Validate macronutrients
  if (mealPlanData.totalProtein && (mealPlanData.totalProtein < 0 || mealPlanData.totalProtein > 500)) {
    errors.totalProtein = 'Proteína deve estar entre 0 e 500g';
  } else if (mealPlanData.totalProtein) {
    sanitizedData.totalProtein = Number(mealPlanData.totalProtein);
  }

  if (mealPlanData.totalCarbs && (mealPlanData.totalCarbs < 0 || mealPlanData.totalCarbs > 800)) {
    errors.totalCarbs = 'Carboidratos deve estar entre 0 e 800g';
  } else if (mealPlanData.totalCarbs) {
    sanitizedData.totalCarbs = Number(mealPlanData.totalCarbs);
  }

  if (mealPlanData.totalFats && (mealPlanData.totalFats < 0 || mealPlanData.totalFats > 200)) {
    errors.totalFats = 'Gorduras deve estar entre 0 e 200g';
  } else if (mealPlanData.totalFats) {
    sanitizedData.totalFats = Number(mealPlanData.totalFats);
  }

  // Validate patient ID if provided
  if (mealPlanData.patientId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(mealPlanData.patientId)) {
      errors.patientId = 'ID do paciente inválido';
    } else {
      sanitizedData.patientId = mealPlanData.patientId;
    }
  }

  // Validate meals array
  if (mealPlanData.meals && Array.isArray(mealPlanData.meals)) {
    sanitizedData.meals = mealPlanData.meals.map((meal: any) => ({
      ...meal,
      name: meal.name ? meal.name.toString().trim().slice(0, 100) : '',
      items: Array.isArray(meal.items) ? meal.items : []
    }));
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};
