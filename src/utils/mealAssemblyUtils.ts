
import { MealItem, MealDistributionItem } from '@/types/meal';

// Sample meal distributions
export const MEAL_DISTRIBUTIONS = [
  { name: 'Café da Manhã', time: '07:00', proteinPercent: 0.25, carbsPercent: 0.30, fatPercent: 0.20 },
  { name: 'Lanche da Manhã', time: '10:00', proteinPercent: 0.15, carbsPercent: 0.10, fatPercent: 0.10 },
  { name: 'Almoço', time: '13:00', proteinPercent: 0.30, carbsPercent: 0.40, fatPercent: 0.40 },
  { name: 'Lanche da Tarde', time: '16:00', proteinPercent: 0.15, carbsPercent: 0.10, fatPercent: 0.10 },
  { name: 'Jantar', time: '19:00', proteinPercent: 0.15, carbsPercent: 0.10, fatPercent: 0.20 }
];

// Sample food database
export const FOOD_DATABASE: MealItem[] = [
  { 
    name: 'Ovos mexidos', 
    portion: '2 unidades', 
    calories: 150, 
    protein: 12, 
    carbs: 1, 
    fat: 10, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Pão integral', 
    portion: '2 fatias', 
    calories: 120, 
    protein: 5, 
    carbs: 20, 
    fat: 2, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Iogurte natural', 
    portion: '200ml', 
    calories: 100, 
    protein: 5, 
    carbs: 8, 
    fat: 5, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Frango grelhado', 
    portion: '100g', 
    calories: 165, 
    protein: 31, 
    carbs: 0, 
    fat: 4, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Arroz integral', 
    portion: '100g', 
    calories: 110, 
    protein: 2, 
    carbs: 22, 
    fat: 1, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Feijão', 
    portion: '100g', 
    calories: 130, 
    protein: 8, 
    carbs: 25, 
    fat: 1, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Banana', 
    portion: '1 unidade média', 
    calories: 105, 
    protein: 1, 
    carbs: 27, 
    fat: 0, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Maçã', 
    portion: '1 unidade média', 
    calories: 80, 
    protein: 0, 
    carbs: 21, 
    fat: 0, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Salmão', 
    portion: '100g', 
    calories: 208, 
    protein: 20, 
    carbs: 0, 
    fat: 14, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Batata doce', 
    portion: '100g', 
    calories: 90, 
    protein: 2, 
    carbs: 21, 
    fat: 0, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Queijo cottage', 
    portion: '50g', 
    calories: 85, 
    protein: 11, 
    carbs: 3, 
    fat: 4, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  },
  { 
    name: 'Aveia', 
    portion: '30g', 
    calories: 117, 
    protein: 5, 
    carbs: 20, 
    fat: 2, 
    time: '',
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    foods: []
  }
];

// Food suggestions based on meal time
const BREAKFAST_FOODS = ['Ovos mexidos', 'Pão integral', 'Iogurte natural', 'Aveia', 'Banana'];
const SNACK_FOODS = ['Banana', 'Maçã', 'Iogurte natural', 'Queijo cottage'];
const LUNCH_DINNER_FOODS = ['Frango grelhado', 'Arroz integral', 'Feijão', 'Batata doce', 'Salmão'];

// Helper function to filter foods by meal name
export const filterFoodsByMeal = (mealName: string): MealItem[] => {
  let foodNames: string[] = [];
  
  if (mealName.toLowerCase().includes('café') || mealName.toLowerCase().includes('manhã')) {
    foodNames = BREAKFAST_FOODS;
  } else if (mealName.toLowerCase().includes('lanche')) {
    foodNames = SNACK_FOODS;
  } else if (mealName.toLowerCase().includes('almoço') || mealName.toLowerCase().includes('jantar')) {
    foodNames = LUNCH_DINNER_FOODS;
  } else {
    // Default to all foods if meal name doesn't match
    return FOOD_DATABASE;
  }
  
  return FOOD_DATABASE.filter(food => foodNames.includes(food.name));
};
