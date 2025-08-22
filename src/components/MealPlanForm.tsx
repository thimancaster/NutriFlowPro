
import React, { useState } from 'react';
import { ConsolidatedMealPlan, ConsolidatedMeal } from '@/types/mealPlanTypes';

interface MealPlanFormData {
  meals: Array<{
    id: string;
    name: string;
    time: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
    items: Array<{
      id: string;
      meal_id: string;
      food_id: string;
      food_name: string;
      quantity: number;
      unit: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      order_index: number;
    }>;
  }>;
}

interface MealPlanFormProps {
  onSubmit: (mealPlan: ConsolidatedMealPlan) => void;
}

const MealPlanForm: React.FC<MealPlanFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<MealPlanFormData>({ meals: [] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform form data to ConsolidatedMealPlan
    const transformedMeals: ConsolidatedMeal[] = formData.meals.map(meal => ({
      ...meal,
      foods: meal.items.map(item => ({
        id: item.id,
        name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fats
      })),
      items: meal.items,
      totalCalories: meal.total_calories,
      totalProtein: meal.total_protein,
      totalCarbs: meal.total_carbs,
      totalFats: meal.total_fats,
      total_calories: meal.total_calories,
      total_protein: meal.total_protein,
      total_carbs: meal.total_carbs,
      total_fats: meal.total_fats
    }));

    const mealPlan: ConsolidatedMealPlan = {
      id: `plan-${Date.now()}`,
      patient_id: '',
      name: 'Generated Meal Plan',
      date: new Date().toISOString().split('T')[0],
      total_calories: transformedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      total_protein: transformedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      total_carbs: transformedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      total_fats: transformedMeals.reduce((sum, meal) => sum + meal.totalFats, 0),
      meals: transformedMeals,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSubmit(mealPlan);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center text-gray-500">
        Formulário de criação de plano alimentar
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
        Criar Plano
      </button>
    </form>
  );
};

export default MealPlanForm;
