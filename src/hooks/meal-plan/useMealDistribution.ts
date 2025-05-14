
import { useState, useCallback, useMemo, useEffect } from 'react';
import { MealDistributionItem, ConsultationData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { mealOptions } from '@/utils/mealGeneratorUtils';

type UseMealDistributionProps = {
  initialDistribution?: MealDistributionItem[];
  consultationData: ConsultationData | null;
};

export const useMealDistribution = ({ 
  initialDistribution,
  consultationData 
}: UseMealDistributionProps) => {
  // Initialize meal distribution with default meals if none provided
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(
    initialDistribution || [
      {
        id: uuidv4(),
        name: 'Café da manhã',
        percentage: 25,
        percent: 25,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        suggestions: []
      },
      {
        id: uuidv4(),
        name: 'Almoço',
        percentage: 40,
        percent: 40,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        suggestions: []
      },
      {
        id: uuidv4(),
        name: 'Jantar',
        percentage: 35,
        percent: 35,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        suggestions: []
      }
    ]
  );

  // Calculate total percentage
  const totalMealPercent = useMemo(() => {
    return mealDistribution.reduce((acc, meal) => acc + (meal.percentage || meal.percent || 0), 0);
  }, [mealDistribution]);

  // Handle meal percentage change
  const handleMealPercentChange = useCallback((id: string, value: number) => {
    setMealDistribution(prev => 
      prev.map(meal => meal.id === id ? { ...meal, percentage: value, percent: value } : meal)
    );
  }, []);

  // Calculate macros for each meal based on the total from consultation data
  useEffect(() => {
    if (consultationData?.results && totalMealPercent === 100) {
      const totalCalories = consultationData.results.get;
      const totalProtein = consultationData.results.macros.protein;
      const totalCarbs = consultationData.results.macros.carbs;
      const totalFat = consultationData.results.macros.fat;
      
      setMealDistribution(prev => 
        prev.map(meal => ({
          ...meal,
          calories: Math.round(totalCalories * (meal.percentage || meal.percent || 0) / 100),
          protein: Math.round(totalProtein * (meal.percentage || meal.percent || 0) / 100),
          carbs: Math.round(totalCarbs * (meal.percentage || meal.percent || 0) / 100),
          fat: Math.round(totalFat * (meal.percentage || meal.percent || 0) / 100),
          suggestions: meal.suggestions || []
        }))
      );
    }
  }, [consultationData, totalMealPercent]);

  // Add a new meal to the distribution
  const addMeal = useCallback(() => {
    const newMealId = uuidv4();
    const newMeal: MealDistributionItem = {
      id: newMealId,
      name: mealOptions[Math.min(mealDistribution.length, mealOptions.length - 1)].name,
      percentage: 0,
      percent: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      suggestions: []
    };
    
    setMealDistribution(prev => [...prev, newMeal]);
  }, [mealDistribution]);

  // Remove a meal from the distribution
  const removeMeal = useCallback((id: string) => {
    setMealDistribution(prev => {
      const filtered = prev.filter(meal => meal.id !== id);
      
      // Recalculate percentages to distribute the removed meal's percentage
      const removedMeal = prev.find(meal => meal.id === id);
      const removedPercent = removedMeal ? (removedMeal.percentage || removedMeal.percent || 0) : 0;
      
      if (removedPercent > 0 && filtered.length > 0) {
        const percentPerMeal = removedPercent / filtered.length;
        return filtered.map(meal => ({
          ...meal,
          percentage: (meal.percentage || meal.percent || 0) + percentPerMeal,
          percent: (meal.percentage || meal.percent || 0) + percentPerMeal
        }));
      }
      
      return filtered;
    });
  }, []);

  return {
    mealDistribution,
    setMealDistribution,
    totalMealPercent,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};
