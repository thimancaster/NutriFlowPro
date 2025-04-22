
import { calculateMacros } from './nutritionCalculations';

// Default meal distribution percentages
export const DEFAULT_MEAL_DISTRIBUTION = [0.25, 0.15, 0.20, 0.10, 0.20, 0.10];

export const MEAL_NAMES = [
  "Café da manhã",
  "Lanche da manhã",
  "Almoço",
  "Lanche da tarde",
  "Jantar",
  "Ceia"
];

// Calculate macros for each meal based on total GET and meal distribution
export function calculateMealDistribution(
  get: number, 
  objective: string = 'manutenção',
  mealDistribution: number[] = DEFAULT_MEAL_DISTRIBUTION
) {
  const totalMacros = calculateMacros(get, objective);
  const meals = [];
  
  for (let i = 0; i < mealDistribution.length; i++) {
    const mealPercent = mealDistribution[i];
    const mealCalories = Math.round(get * mealPercent);
    
    // Calculate macros for this meal
    const choPerMeal = Math.round((mealCalories * totalMacros.carbs) / get);
    const protPerMeal = Math.round((mealCalories * totalMacros.protein) / get);
    const fatPerMeal = Math.round((mealCalories * totalMacros.fat) / get);
    
    // Generate food suggestions
    const foodSuggestions = generateFoodSuggestions(choPerMeal, protPerMeal, fatPerMeal, i);
    
    meals.push({
      mealNumber: i + 1,
      name: MEAL_NAMES[i],
      calories: mealCalories,
      cho: choPerMeal,
      protein: protPerMeal,
      fat: fatPerMeal,
      percentage: mealPercent * 100,
      foodSuggestions
    });
  }
  
  return {
    meals,
    totalMacros
  };
}

// Food suggestions database simplified for demo
const foodDatabase = {
  highProtein: [
    "Peito de frango", "Atum", "Ovos", "Whey protein", "Iogurte grego", 
    "Queijo cottage", "Peito de peru", "Tofu", "Lentilhas", "Salmão"
  ],
  highCarbs: [
    "Arroz integral", "Batata doce", "Aveia", "Banana", "Pão integral",
    "Macarrão integral", "Quinoa", "Milho", "Feijão", "Laranja"
  ],
  highFat: [
    "Abacate", "Azeite", "Castanhas", "Amendoim", "Sementes de chia",
    "Sementes de linhaça", "Coco", "Chocolate amargo", "Manteiga", "Queijos"
  ],
  breakfast: [
    "Iogurte com granola", "Ovos mexidos", "Torrada integral com abacate", 
    "Tapioca com queijo", "Smoothie de frutas", "Panquecas proteicas"
  ],
  snacks: [
    "Mix de castanhas", "Barra de proteína", "Frutas", "Iogurte", 
    "Shake proteico", "Omelete pequeno"
  ],
  lunch: [
    "Frango grelhado com legumes", "Salmão com salada", "Arroz, feijão e carne magra", 
    "Bowl de quinoa com legumes", "Wrap de frango", "Salada com atum"
  ],
  dinner: [
    "Omelete de vegetais", "Sopa de legumes com frango", "Peixe com legumes", 
    "Salada proteica", "Tofu grelhado com legumes", "Carne magra com vegetais"
  ]
};

// Generate food suggestions based on macros and meal number
function generateFoodSuggestions(carbs: number, protein: number, fat: number, mealIndex: number): string[] {
  const suggestions = [];
  const total = carbs + protein + fat;
  const carbsPercent = (carbs / total) * 100;
  const proteinPercent = (protein / total) * 100;
  const fatPercent = (fat / total) * 100;
  
  // Add appropriate suggestions based on meal time
  if (mealIndex === 0) { // Breakfast
    suggestions.push(...getRandomElements(foodDatabase.breakfast, 2));
  } else if (mealIndex === 2 || mealIndex === 4) { // Lunch or dinner
    suggestions.push(...getRandomElements(foodDatabase.lunch, 2));
  } else { // Snacks
    suggestions.push(...getRandomElements(foodDatabase.snacks, 2));
  }
  
  // Add specific macronutrient-focused foods
  if (proteinPercent > 30) {
    suggestions.push(...getRandomElements(foodDatabase.highProtein, 2));
  }
  
  if (carbsPercent > 40) {
    suggestions.push(...getRandomElements(foodDatabase.highCarbs, 1));
  }
  
  if (fatPercent > 30) {
    suggestions.push(...getRandomElements(foodDatabase.highFat, 1));
  }
  
  // Return unique suggestions
  return [...new Set(suggestions)].slice(0, 4);
}

// Helper to get random elements from array
function getRandomElements(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Save meal plan to database
export async function saveMealPlan(consultationId: string, meals: any[], totalMacros: any) {
  try {
    // This would be implemented with actual database calls
    console.log('Saving meal plan for consultation:', consultationId);
    
    // Return success
    return {
      success: true,
      message: 'Meal plan saved successfully'
    };
  } catch (error) {
    console.error('Error saving meal plan:', error);
    return {
      success: false,
      message: 'Failed to save meal plan'
    };
  }
}
