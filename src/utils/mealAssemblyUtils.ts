
import { MealItem } from '@/types/meal';

export const MEAL_DISTRIBUTIONS = [
  {
    name: 'Café da Manhã',
    time: '07:00',
    proteinPercent: 0.25,
    carbsPercent: 0.3,
    fatPercent: 0.2
  },
  {
    name: 'Lanche da Manhã',
    time: '10:00',
    proteinPercent: 0.15,
    carbsPercent: 0.1,
    fatPercent: 0.1
  },
  {
    name: 'Almoço',
    time: '13:00',
    proteinPercent: 0.3,
    carbsPercent: 0.3,
    fatPercent: 0.3
  },
  {
    name: 'Lanche da Tarde',
    time: '16:00',
    proteinPercent: 0.15,
    carbsPercent: 0.1,
    fatPercent: 0.1
  },
  {
    name: 'Jantar',
    time: '19:00',
    proteinPercent: 0.15,
    carbsPercent: 0.2,
    fatPercent: 0.3
  }
];

// Sample foods - in a real app these would come from a database
export const SAMPLE_FOODS: MealItem[] = [
  {
    id: '1',
    name: 'Frango grelhado',
    portion: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    time: '',
    proteinPercent: 0.75,
    carbsPercent: 0,
    fatPercent: 0.25,
    foods: []
  },
  {
    id: '2',
    name: 'Arroz branco cozido',
    portion: '100g',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    time: '',
    proteinPercent: 0.08,
    carbsPercent: 0.86,
    fatPercent: 0.06,
    foods: []
  },
  {
    id: '3',
    name: 'Feijão preto cozido',
    portion: '100g',
    calories: 132,
    protein: 8.7,
    carbs: 24,
    fat: 0.5,
    time: '',
    proteinPercent: 0.26,
    carbsPercent: 0.72,
    fatPercent: 0.02,
    foods: []
  },
  {
    id: '4',
    name: 'Batata doce assada',
    portion: '100g',
    calories: 90,
    protein: 2,
    carbs: 21,
    fat: 0.1,
    time: '',
    proteinPercent: 0.09,
    carbsPercent: 0.9,
    fatPercent: 0.01,
    foods: []
  },
  {
    id: '5',
    name: 'Ovo cozido',
    portion: '1 unidade (50g)',
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fat: 5.3,
    time: '',
    proteinPercent: 0.32,
    carbsPercent: 0.03,
    fatPercent: 0.65,
    foods: []
  },
  {
    id: '6',
    name: 'Pão integral',
    portion: '1 fatia (30g)',
    calories: 81,
    protein: 4,
    carbs: 13.8,
    fat: 1.4,
    time: '',
    proteinPercent: 0.19,
    carbsPercent: 0.68,
    fatPercent: 0.13,
    foods: []
  },
  {
    id: '7',
    name: 'Banana',
    portion: '1 média (100g)',
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    time: '',
    proteinPercent: 0.05,
    carbsPercent: 0.93,
    fatPercent: 0.02,
    foods: []
  },
  {
    id: '8',
    name: 'Aveia em flocos',
    portion: '30g',
    calories: 117,
    protein: 4.3,
    carbs: 19.8,
    fat: 2.4,
    time: '',
    proteinPercent: 0.14,
    carbsPercent: 0.68,
    fatPercent: 0.18,
    foods: []
  },
  {
    id: '9',
    name: 'Leite desnatado',
    portion: '250ml',
    calories: 83,
    protein: 8.3,
    carbs: 12.3,
    fat: 0.2,
    time: '',
    proteinPercent: 0.4,
    carbsPercent: 0.59,
    fatPercent: 0.01,
    foods: []
  },
  {
    id: '10',
    name: 'Maçã',
    portion: '1 média (150g)',
    calories: 78,
    protein: 0.4,
    carbs: 20.6,
    fat: 0.3,
    time: '',
    proteinPercent: 0.02,
    carbsPercent: 0.95,
    fatPercent: 0.03,
    foods: []
  }
];

// More specific foods for breakfast
const BREAKFAST_FOODS = [
  ...SAMPLE_FOODS.filter(food => ['Pão integral', 'Ovo cozido', 'Aveia em flocos', 'Leite desnatado', 'Banana', 'Maçã'].includes(food.name)),
  {
    id: '11',
    name: 'Iogurte natural',
    portion: '200g',
    calories: 122,
    protein: 8.5,
    carbs: 11.4,
    fat: 4.3,
    time: '',
    proteinPercent: 0.28,
    carbsPercent: 0.37,
    fatPercent: 0.35,
    foods: []
  },
  {
    id: '12',
    name: 'Queijo branco',
    portion: '30g',
    calories: 80,
    protein: 5.7,
    carbs: 0.8,
    fat: 6.1,
    time: '',
    proteinPercent: 0.28,
    carbsPercent: 0.04,
    fatPercent: 0.68,
    foods: []
  },
];

// More specific foods for lunch/dinner
const MAIN_MEAL_FOODS = [
  ...SAMPLE_FOODS.filter(food => ['Frango grelhado', 'Arroz branco cozido', 'Feijão preto cozido', 'Batata doce assada'].includes(food.name)),
  {
    id: '13',
    name: 'Carne bovina magra',
    portion: '100g',
    calories: 198,
    protein: 26,
    carbs: 0,
    fat: 10.7,
    time: '',
    proteinPercent: 0.52,
    carbsPercent: 0,
    fatPercent: 0.48,
    foods: []
  },
  {
    id: '14',
    name: 'Filé de peixe',
    portion: '100g',
    calories: 128,
    protein: 24,
    carbs: 0,
    fat: 3.5,
    time: '',
    proteinPercent: 0.75,
    carbsPercent: 0,
    fatPercent: 0.25,
    foods: []
  },
  {
    id: '15',
    name: 'Brócolis cozido',
    portion: '100g',
    calories: 35,
    protein: 2.4,
    carbs: 7.2,
    fat: 0.4,
    time: '',
    proteinPercent: 0.27,
    carbsPercent: 0.68,
    fatPercent: 0.05,
    foods: []
  },
];

// More specific foods for snacks
const SNACK_FOODS = [
  ...SAMPLE_FOODS.filter(food => ['Banana', 'Maçã', 'Aveia em flocos'].includes(food.name)),
  {
    id: '16',
    name: 'Castanhas (mix)',
    portion: '30g',
    calories: 180,
    protein: 5,
    carbs: 6,
    fat: 15,
    time: '',
    proteinPercent: 0.11,
    carbsPercent: 0.13,
    fatPercent: 0.76,
    foods: []
  },
  {
    id: '17',
    name: 'Whey protein',
    portion: '30g',
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    time: '',
    proteinPercent: 0.8,
    carbsPercent: 0.1,
    fatPercent: 0.1,
    foods: []
  },
];

/**
 * Returns appropriate foods based on the meal name
 */
export const filterFoodsByMeal = (mealName: string): MealItem[] => {
  const normalizedName = mealName.toLowerCase();
  
  if (normalizedName.includes('café') || normalizedName.includes('cafe') || normalizedName.includes('manhã')) {
    return BREAKFAST_FOODS;
  } else if (normalizedName.includes('almoço') || normalizedName.includes('almoco') || normalizedName.includes('jantar')) {
    return MAIN_MEAL_FOODS;
  } else if (normalizedName.includes('lanche')) {
    return SNACK_FOODS;
  }
  
  // Default to all foods if no match
  return SAMPLE_FOODS;
};
