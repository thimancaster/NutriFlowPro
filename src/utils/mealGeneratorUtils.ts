import { supabase } from '@/integrations/supabase/client';
import { ConsultationData } from '@/types';
import { MealItem, MealDistributionItem } from '@/types/meal';
import { logger } from '@/utils/logger';

// Utility functions to help with meal plan generation

export interface MealPlanSettings {
  patientName?: string;
  patientData?: any;
  patientAge?: number;
  patientGender?: string;
  numMeals?: string;
  totalCalories?: string;
  dietType?: string;
  restrictions?: string[];
}

export const mealOptions = [
  { id: '1', name: 'Café da manhã' },
  { id: '2', name: 'Lanche da manhã' },
  { id: '3', name: 'Almoço' },
  { id: '4', name: 'Lanche da tarde' },
  { id: '5', name: 'Jantar' },
  { id: '6', name: 'Ceia' }
];

export const calculateTotalCalories = (
  proteinGrams: number,
  carbsGrams: number,
  fatGrams: number
): number => {
  const proteinCalories = proteinGrams * 4;
  const carbsCalories = carbsGrams * 4;
  const fatCalories = fatGrams * 9;
  return proteinCalories + carbsCalories + fatCalories;
};

export const calculateMacroPercentages = (
  totalCalories: number,
  proteinGrams: number,
  carbsGrams: number,
  fatGrams: number
): { protein: number; carbs: number; fat: number } => {
  const proteinCalories = proteinGrams * 4;
  const carbsCalories = carbsGrams * 4;
  const fatCalories = fatGrams * 9;

  const proteinPercentage = (proteinCalories / totalCalories) * 100;
  const carbsPercentage = (carbsCalories / totalCalories) * 100;
  const fatPercentage = (fatCalories / totalCalories) * 100;

  return {
    protein: proteinPercentage,
    carbs: carbsPercentage,
    fat: fatPercentage,
  };
};

export const adjustMealPercentages = (
  mealDistribution: Record<string, MealDistributionItem>,
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFats: number
): Record<string, MealDistributionItem> => {
  const adjustedDistribution: Record<string, MealDistributionItem> = {};

  for (const key in mealDistribution) {
    if (mealDistribution.hasOwnProperty(key)) {
      const meal = mealDistribution[key];
      adjustedDistribution[key] = {
        ...meal,
        calories: Math.round((meal.percent / 100) * totalCalories),
        protein: Math.round((meal.percent / 100) * totalProtein),
        carbs: Math.round((meal.percent / 100) * totalCarbs),
        fat: Math.round((meal.percent / 100) * totalFats),
      };
    }
  }

  return adjustedDistribution;
};

export const generateMealSuggestions = async (
  macroRatios: { protein: number; carbs: number; fat: number },
  foodPreferences: string[],
  allergies: string[]
): Promise<string[]> => {
  // Placeholder function - replace with actual API call or data processing
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    `Sugestão 1: Refeição com ${macroRatios.protein}% de proteína`,
    `Sugestão 2: Refeição com ${macroRatios.carbs}% de carboidratos`,
    `Sugestão 3: Refeição com ${macroRatios.fat}% de gordura`,
  ];
};

export const validateConsultationData = (
  consultationData: ConsultationData | null
): boolean => {
  if (!consultationData) {
    logger.error('Consultation data is null or undefined');
    return false;
  }

  const requiredFields = [
    'patient_id',
    'totalCalories',
    'protein',
    'carbs',
    'fats',
  ];

  for (const field of requiredFields) {
    if (!consultationData[field as keyof ConsultationData]) {
      logger.error(`Field ${field} is missing in consultation data`);
      return false;
    }
  }

  return true;
};

export const generateMealPlanData = (
  consultationData: ConsultationData,
  mealDistribution: Record<string, MealDistributionItem>
) => {
  if (!consultationData || !mealDistribution) {
    logger.error('Missing required data for meal plan generation');
    return null;
  }

  const meals = Object.values(mealDistribution).map(meal => ({
    id: meal.id,
    name: meal.name,
    time: '', // Will be set later
    percentage: meal.percent,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    foods: [],
    totalCalories: meal.calories,
    totalProtein: meal.protein,
    totalCarbs: meal.carbs,
    totalFats: meal.fat
  }));

  return {
    id: '',
    patient_id: consultationData.patient_id || '',
    date: new Date().toISOString().split('T')[0],
    meals,
    total_calories: consultationData.totalCalories,
    total_protein: consultationData.protein,
    total_carbs: consultationData.carbs,
    total_fats: consultationData.fats,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
