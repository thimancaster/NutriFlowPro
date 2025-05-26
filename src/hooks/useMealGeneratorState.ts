
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MealGeneratorSettings {
  numMeals: string;
  totalCalories: string;
  dietType: string;
  restrictions: string[];
}

export const useMealGeneratorState = () => {
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [generatorSettings, setGeneratorSettings] = useState<MealGeneratorSettings>({
    numMeals: '6', // Default to 6 meals
    totalCalories: '2000',
    dietType: 'balanced',
    restrictions: [] as string[]
  });

  const handleSettingsChange = (settings: Partial<MealGeneratorSettings>) => {
    setGeneratorSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  const generateMealPlanData = (
    numMeals: string,
    totalCalories: string
  ) => {
    // Simple meal plan generation logic
    const meals = [];
    const mealCount = parseInt(numMeals);
    const calories = parseInt(totalCalories);
    const caloriesPerMeal = Math.round(calories / mealCount);

    for (let i = 0; i < mealCount; i++) {
      meals.push({
        id: `meal-${i + 1}`,
        name: `Refeição ${i + 1}`,
        calories: caloriesPerMeal,
        protein: Math.round(caloriesPerMeal * 0.25 / 4),
        carbs: Math.round(caloriesPerMeal * 0.45 / 4),
        fat: Math.round(caloriesPerMeal * 0.30 / 9),
        foods: []
      });
    }

    return {
      meals,
      total_calories: calories,
      total_protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
      total_carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
      total_fats: meals.reduce((sum, meal) => sum + meal.fat, 0)
    };
  };

  const generateMealPlan = () => {
    const plan = generateMealPlanData(
      generatorSettings.numMeals,
      generatorSettings.totalCalories
    );
    
    setMealPlan(plan);
    
    toast({
      title: "Plano Alimentar Gerado",
      description: `Plano com ${generatorSettings.numMeals} refeições e ${generatorSettings.totalCalories} calorias criado.`,
    });
  };

  return {
    mealPlan,
    generatorSettings,
    handleSettingsChange,
    generateMealPlan
  };
};
