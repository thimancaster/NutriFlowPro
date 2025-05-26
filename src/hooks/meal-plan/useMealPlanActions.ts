
import { useState } from 'react';
import { Patient, ConsultationData } from '@/types';
import { MealPlan, MealDistributionItem } from '@/types/meal';

interface UseMealPlanActionsProps {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  mealDistribution: Record<string, MealDistributionItem>;
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
}

export const useMealPlanActions = ({
  activePatient,
  consultationData,
  mealPlan,
  setMealPlan,
  mealDistribution,
  saveMealPlan
}: UseMealPlanActionsProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMealPlan = async () => {
    if (!activePatient || !consultationData) {
      console.error('Missing patient or consultation data');
      return;
    }

    setIsSaving(true);
    
    try {
      // Convert meal distribution to meals array
      const meals = Object.values(mealDistribution).map(meal => ({
        id: meal.id,
        name: meal.name,
        time: '', // Will be filled later
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

      const newMealPlan: MealPlan = {
        patient_id: activePatient.id,
        date: new Date().toISOString().split('T')[0],
        meals,
        total_calories: consultationData.totalCalories,
        total_protein: consultationData.protein,
        total_carbs: consultationData.carbs,
        total_fats: consultationData.fats
      };

      setMealPlan(newMealPlan);
      
      // Save to backend if there's a consultation ID
      if (consultationData.id) {
        await saveMealPlan(consultationData.id, newMealPlan);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveMealPlan
  };
};
