import { supabase } from "@/integrations/supabase/client";

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
  const meals = [];
  
  for (let i = 0; i < mealDistribution.length; i++) {
    const mealPercent = mealDistribution[i];
    const mealCalories = Math.round(get * mealPercent);
    
    // Calculate macros for this meal
    const choPerMeal = Math.round((mealCalories * 0.50) / 4);
    const protPerMeal = Math.round((mealCalories * 0.20) / 4);
    const fatPerMeal = Math.round((mealCalories * 0.30) / 9);
    
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
    totalCalories: get,
    totalProtein: meals.reduce((acc, meal) => acc + meal.protein, 0),
    totalCarbs: meals.reduce((acc, meal) => acc + meal.cho, 0),
    totalFats: meals.reduce((acc, meal) => acc + meal.fat, 0)
  };
}

// Generate food suggestions based on macros and meal number
function generateFoodSuggestions(carbs: number, protein: number, fat: number, mealIndex: number): string[] {
  // This is a simplified version. In a real app, you'd have a database of foods
  const suggestions = [];
  const total = carbs + protein + fat;
  const carbsPercent = (carbs / total) * 100;
  const proteinPercent = (protein / total) * 100;
  const fatPercent = (fat / total) * 100;
  
  // Example suggestions based on meal time
  if (mealIndex === 0) { // Breakfast
    suggestions.push(
      "Ovos mexidos",
      "Pão integral",
      "Iogurte com granola",
      "Frutas frescas"
    );
  } else if (mealIndex === 2 || mealIndex === 4) { // Lunch or dinner
    suggestions.push(
      "Frango grelhado",
      "Arroz integral",
      "Legumes cozidos",
      "Salada verde"
    );
  } else { // Snacks
    suggestions.push(
      "Mix de castanhas",
      "Frutas",
      "Iogurte",
      "Barra de proteína"
    );
  }
  
  return suggestions;
}

// Save meal plan to database
export async function saveMealPlan(consultationId: string, meals: any[], totalMacros: any) {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        consultation_id: consultationId,
        meals,
        total_calories: totalMacros.totalCalories,
        total_protein: totalMacros.totalProtein,
        total_carbs: totalMacros.totalCarbs,
        total_fats: totalMacros.totalFats,
        date: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    
    return {
      success: true,
      data,
      message: 'Plano alimentar salvo com sucesso'
    };
  } catch (error) {
    console.error('Error saving meal plan:', error);
    return {
      success: false,
      message: 'Falha ao salvar plano alimentar'
    };
  }
}
