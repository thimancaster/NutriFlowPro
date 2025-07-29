import { useState, useEffect, useCallback } from 'react';
import {
  MealPlan,
  MealDistributionItem,
  MealAssemblyFood,
  ConsultationData
} from '@/types';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useMealPlanActions } from '@/hooks/meal-plan/useMealPlanActions';

interface UseMealPlanStateReturn {
  patient: any;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan | null) => void;
  mealDistribution: MealDistributionItem[];
  setMealDistribution: (mealDistribution: MealDistributionItem[]) => void;
  updateMealDistribution: (itemId: string, updates: Partial<MealDistributionItem>) => void;
  addFoodToMeal: (mealId: string, food: MealAssemblyFood) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  updateFoodInMeal: (mealId: string, foodId: string, updates: Partial<MealAssemblyFood>) => void;
  clearMealFoods: (mealId: string) => void;
  resetMealPlan: () => void;
  // Additional properties from meal plan actions
  totalMealPercent: number;
  isSaving: boolean;
  handleMealPercentChange: (mealId: string, percent: number) => void;
  handleSaveMealPlan: () => Promise<void>;
  addMeal: () => void;
  removeMeal: (mealId: string) => void;
}

const initialMealDistribution: MealDistributionItem[] = [
  {
    id: 'breakfast',
    name: 'Café da Manhã',
    time: '07:00 - 09:00',
    percentage: 25,
    percent: 25,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    suggestions: []
  },
  {
    id: 'lunch',
    name: 'Almoço',
    time: '12:00 - 14:00',
    percentage: 35,
    percent: 35,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    suggestions: []
  },
  {
    id: 'afternoonSnack',
    name: 'Lanche da Tarde',
    time: '16:00 - 18:00',
    percentage: 15,
    percent: 15,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    suggestions: []
  },
  {
    id: 'dinner',
    name: 'Jantar',
    time: '19:00 - 21:00',
    percentage: 25,
    percent: 25,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    suggestions: []
  }
];

export const useMealPlanState = (
  patientId?: string
): UseMealPlanStateReturn => {
  const { activePatient: patient } = usePatient();
  const { consultationData, setConsultationData, mealPlan, setMealPlan } = useMealPlan();
  const [mealDistributionItems, setMealDistributionItems] = useState<Record<string, MealDistributionItem>>(
    initialMealDistribution.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, MealDistributionItem>)
  );

  // Get meal plan actions
  const { isSaving, handleSaveMealPlan } = useMealPlanActions();

  const setMealDistribution = useCallback((distribution: MealDistributionItem[]) => {
    const newDistribution: Record<string, MealDistributionItem> = {};
    distribution.forEach(item => {
      newDistribution[item.id] = item;
    });
    setMealDistributionItems(newDistribution);
  }, []);

  const updateMealDistribution = useCallback((itemId: string, updates: Partial<MealDistributionItem>) => {
    setMealDistributionItems(prev => {
      const updatedItem = { ...prev[itemId], ...updates };
      return { ...prev, [itemId]: updatedItem };
    });
  }, []);

  const handleMealPercentChange = useCallback((mealId: string, percent: number) => {
    updateMealDistribution(mealId, { percentage: percent, percent });
  }, [updateMealDistribution]);

  const addMeal = useCallback(() => {
    const keys = Object.keys(mealDistributionItems);
    const newId = `meal-${keys.length + 1}`;
    const newMeal: MealDistributionItem = {
      id: newId,
      name: `Refeição ${keys.length + 1}`,
      time: '12:00',
      percentage: 0,
      percent: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    };
    setMealDistributionItems(prev => ({ ...prev, [newId]: newMeal }));
  }, [mealDistributionItems]);

  const removeMeal = useCallback((mealId: string) => {
    setMealDistributionItems(prev => {
      const newDistribution = { ...prev };
      delete newDistribution[mealId];
      return newDistribution;
    });
  }, []);

  const addFoodToMeal = useCallback((mealId: string, food: MealAssemblyFood) => {
    setMealDistributionItems(prev => {
      const meal = prev[mealId];
      if (meal) {
        const updatedFoods = [...meal.foods, food];
        const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0);
        const totalProtein = updatedFoods.reduce((sum, food) => sum + food.protein, 0);
        const totalCarbs = updatedFoods.reduce((sum, food) => sum + food.carbs, 0);
        const totalFats = updatedFoods.reduce((sum, food) => sum + food.fat, 0);

        const updatedMeal = {
          ...meal,
          foods: updatedFoods,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
        };
        return { ...prev, [mealId]: updatedMeal };
      }
      return prev;
    });
  }, []);

  const removeFoodFromMeal = useCallback((mealId: string, foodId: string) => {
    setMealDistributionItems(prev => {
      const meal = prev[mealId];
      if (meal) {
        const updatedFoods = meal.foods.filter((food: MealAssemblyFood) => food.id !== foodId);
        const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0);
        const totalProtein = updatedFoods.reduce((sum, food) => sum + food.protein, 0);
        const totalCarbs = updatedFoods.reduce((sum, food) => sum + food.carbs, 0);
        const totalFats = updatedFoods.reduce((sum, food) => sum + food.fat, 0);

        const updatedMeal = {
          ...meal,
          foods: updatedFoods,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
        };
        return { ...prev, [mealId]: updatedMeal };
      }
      return prev;
    });
  }, []);

  const updateFoodInMeal = useCallback((mealId: string, foodId: string, updates: Partial<MealAssemblyFood>) => {
    setMealDistributionItems(prev => {
      const meal = prev[mealId];
      if (meal) {
        const updatedFoods = meal.foods.map((food: MealAssemblyFood) =>
          food.id === foodId ? { ...food, ...updates } : food
        );

        const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0);
        const totalProtein = updatedFoods.reduce((sum, food) => sum + food.protein, 0);
        const totalCarbs = updatedFoods.reduce((sum, food) => sum + food.carbs, 0);
        const totalFats = updatedFoods.reduce((sum, food) => sum + food.fat, 0);

        const updatedMeal = {
          ...meal,
          foods: updatedFoods,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
        };
        return { ...prev, [mealId]: updatedMeal };
      }
      return prev;
    });
  }, []);

  const clearMealFoods = useCallback((mealId: string) => {
    setMealDistributionItems(prev => {
      const meal = prev[mealId];
      if (meal) {
        const updatedMeal = {
          ...meal,
          foods: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
        };
        return { ...prev, [mealId]: updatedMeal };
      }
      return prev;
    });
  }, []);

  const resetMealPlan = useCallback(() => {
    setMealDistributionItems(
      initialMealDistribution.reduce((acc, item) => {
        acc[item.id] = { ...item };
        return acc;
      }, {} as Record<string, MealDistributionItem>)
    );
    setMealPlan(null);
  }, [setMealPlan]);

  // Calculate total percentage
  const totalMealPercent = Object.values(mealDistributionItems)
    .reduce((total, meal) => total + (meal.percentage || 0), 0);

  useEffect(() => {
    if (patientId && patient?.id !== patientId) {
      resetMealPlan();
    }
  }, [patientId, patient, resetMealPlan]);

  return {
    patient,
    consultationData,
    mealPlan,
    setMealPlan,
    mealDistribution: Object.values(mealDistributionItems),
    setMealDistribution,
    updateMealDistribution,
    addFoodToMeal,
    removeFoodFromMeal,
    updateFoodInMeal,
    clearMealFoods,
    resetMealPlan,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  };
};
