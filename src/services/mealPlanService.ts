import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanFood, MealPlanMeal, MealType } from '@/types/meal';

export class MealPlanService {
  static async generateMealPlan(params: any): Promise<any> {
    const meals = [
      {
        id: crypto.randomUUID(),
        name: 'Café da Manhã',
        time: '07:00',
        type: 'cafe_da_manha',
        foods: [
          { id: crypto.randomUUID(), name: 'Omelete', quantity: 2, unit: 'unidades', calories: 150, protein: 12, carbs: 3, fat: 10 },
          { id: crypto.randomUUID(), name: 'Pão Integral', quantity: 2, unit: 'fatias', calories: 120, protein: 4, carbs: 20, fat: 1 },
        ],
        totalCalories: 270,
        totalProtein: 16,
        totalCarbs: 23,
        totalFats: 11,
        total_calories: 270,
        total_protein: 16,
        total_carbs: 23,
        total_fats: 11,
      },
      {
        id: crypto.randomUUID(),
        name: 'Almoço',
        time: '12:00',
        type: 'almoco',
        foods: [
          { id: crypto.randomUUID(), name: 'Frango Grelhado', quantity: 150, unit: 'gramas', calories: 200, protein: 30, carbs: 0, fat: 8 },
          { id: crypto.randomUUID(), name: 'Arroz Integral', quantity: 100, unit: 'gramas', calories: 110, protein: 2, carbs: 25, fat: 1 },
          { id: crypto.randomUUID(), name: 'Salada Mista', quantity: 200, unit: 'gramas', calories: 50, protein: 1, carbs: 10, fat: 1 },
        ],
        totalCalories: 360,
        totalProtein: 33,
        totalCarbs: 35,
        totalFats: 10,
        total_calories: 360,
        total_protein: 33,
        total_carbs: 35,
        total_fats: 10,
      },
      {
        id: crypto.randomUUID(),
        name: 'Lanche da Tarde',
        time: '16:00',
        type: 'lanche_tarde',
        foods: [
          { id: crypto.randomUUID(), name: 'Iogurte Natural', quantity: 200, unit: 'gramas', calories: 140, protein: 10, carbs: 15, fat: 4 },
          { id: crypto.randomUUID(), name: 'Frutas Vermelhas', quantity: 100, unit: 'gramas', calories: 50, protein: 1, carbs: 12, fat: 0 },
        ],
        totalCalories: 190,
        totalProtein: 11,
        totalCarbs: 27,
        totalFats: 4,
        total_calories: 190,
        total_protein: 11,
        total_carbs: 27,
        total_fats: 4,
      },
      {
        id: crypto.randomUUID(),
        name: 'Jantar',
        time: '20:00',
        type: 'jantar',
        foods: [
          { id: crypto.randomUUID(), name: 'Salmão Assado', quantity: 150, unit: 'gramas', calories: 250, protein: 30, carbs: 0, fat: 13 },
          { id: crypto.randomUUID(), name: 'Brócolis Cozido', quantity: 200, unit: 'gramas', calories: 60, protein: 4, carbs: 10, fat: 0 },
        ],
        totalCalories: 310,
        totalProtein: 34,
        totalCarbs: 10,
        totalFats: 13,
        total_calories: 310,
        total_protein: 34,
        total_carbs: 10,
        total_fats: 13,
      },
    ];

    const transformedMeals: MealPlanMeal[] = meals.map(meal => ({
      ...meal,
      type: meal.type || 'cafe_da_manha' as MealType,
      foods: meal.foods || [],
      items: meal.items || meal.foods || [],
      totalCalories: meal.totalCalories || 0,
      totalProtein: meal.totalProtein || 0,
      totalCarbs: meal.totalCarbs || 0,
      totalFats: meal.totalFats || 0,
      total_calories: meal.total_calories || meal.totalCalories || 0,
      total_protein: meal.total_protein || meal.totalProtein || 0,
      total_carbs: meal.total_carbs || meal.totalCarbs || 0,
      total_fats: meal.total_fats || meal.totalFats || 0,
    }));

    return {
      id: crypto.randomUUID(),
      name: params.name || 'Plano Alimentar',
      user_id: params.userId,
      patient_id: params.patientId,
      date: params.date || new Date().toISOString().split('T')[0],
      meals: transformedMeals,
      total_calories: transformedMeals.reduce((sum, meal) => sum + meal.total_calories, 0),
      total_protein: transformedMeals.reduce((sum, meal) => sum + meal.total_protein, 0),
      total_carbs: transformedMeals.reduce((sum, meal) => sum + meal.total_carbs, 0),
      total_fats: transformedMeals.reduce((sum, meal) => sum + meal.total_fats, 0),
      notes: params.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static async getMealPlan(id: string): Promise<MealPlan | null> {
    try {
      // Simulate fetching meal plan data from a database
      const mealPlan: MealPlan = {
        id: id,
        name: 'Plano Alimentar Exemplo',
        user_id: 'user-123',
        patient_id: 'patient-456',
        date: new Date().toISOString().split('T')[0],
        total_calories: 1200,
        total_protein: 100,
        total_carbs: 150,
        total_fats: 50,
        meals: [
          {
            id: crypto.randomUUID(),
            name: 'Café da Manhã',
            time: '07:00',
            type: 'cafe_da_manha',
            foods: [
              { id: crypto.randomUUID(), name: 'Omelete', quantity: 2, unit: 'unidades', calories: 150, protein: 12, carbs: 3, fat: 10 },
              { id: crypto.randomUUID(), name: 'Pão Integral', quantity: 2, unit: 'fatias', calories: 120, protein: 4, carbs: 20, fat: 1 },
            ],
            totalCalories: 270,
            totalProtein: 16,
            totalCarbs: 23,
            totalFats: 11,
            total_calories: 270,
            total_protein: 16,
            total_carbs: 23,
            total_fats: 11,
          },
          {
            id: crypto.randomUUID(),
            name: 'Almoço',
            time: '12:00',
            type: 'almoco',
            foods: [
              { id: crypto.randomUUID(), name: 'Frango Grelhado', quantity: 150, unit: 'gramas', calories: 200, protein: 30, carbs: 0, fat: 8 },
              { id: crypto.randomUUID(), name: 'Arroz Integral', quantity: 100, unit: 'gramas', calories: 110, protein: 2, carbs: 25, fat: 1 },
              { id: crypto.randomUUID(), name: 'Salada Mista', quantity: 200, unit: 'gramas', calories: 50, protein: 1, carbs: 10, fat: 1 },
            ],
            totalCalories: 360,
            totalProtein: 33,
            totalCarbs: 35,
            totalFats: 10,
            total_calories: 360,
            total_protein: 33,
            total_carbs: 35,
            total_fats: 10,
          },
        ],
        notes: 'Plano alimentar exemplo para teste.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return mealPlan;
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      return null;
    }
  }

  static async saveMealPlan(mealPlan: MealPlan): Promise<MealPlan | null> {
    try {
      // Simulate saving the meal plan to a database
      console.log("Meal plan saved:", mealPlan);
      return mealPlan;
    } catch (error) {
      console.error("Error saving meal plan:", error);
      return null;
    }
  }
}
