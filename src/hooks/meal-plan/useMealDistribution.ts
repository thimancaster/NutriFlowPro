
import { useState, useEffect } from 'react';
import { MealDistributionItem } from '@/types/meal';
import { ConsultationData } from '@/types';

export const useMealDistribution = (
  initialDistribution: MealDistributionItem[],
  consultationData: ConsultationData | null
) => {
  const [mealDistribution, setMealDistribution] = useState<Record<string, MealDistributionItem>>({});

  // Initialize meal distribution on mount or when consultation data changes
  useEffect(() => {
    if (consultationData && consultationData.totalCalories) {
      const distributionMap: Record<string, MealDistributionItem> = {};
      
      initialDistribution.forEach((meal, index) => {
        const mealKey = `meal${index + 1}`;
        const mealCalories = Math.round((meal.percentage / 100) * consultationData.totalCalories);
        const mealProtein = Math.round((meal.percentage / 100) * consultationData.protein);
        const mealCarbs = Math.round((meal.percentage / 100) * consultationData.carbs);
        const mealFat = Math.round((meal.percentage / 100) * consultationData.fats);

        distributionMap[mealKey] = {
          id: meal.id || mealKey,
          name: meal.name,
          time: meal.time,
          percentage: meal.percentage,
          percent: meal.percentage, // Legacy compatibility
          calories: mealCalories,
          protein: mealProtein,
          carbs: mealCarbs,
          fat: mealFat,
          foods: [],
          totalCalories: mealCalories,
          totalProtein: mealProtein,
          totalCarbs: mealCarbs,
          totalFats: mealFat,
          proteinPercent: 0,
          carbsPercent: 0,
          fatPercent: 0,
          suggestions: meal.suggestions || []
        };
      });
      
      setMealDistribution(distributionMap);
    }
  }, [consultationData, initialDistribution]);

  const handleMealPercentChange = (mealKey: string, newValue: number | number[]) => {
    const percentValue = Array.isArray(newValue) ? newValue[0] : newValue;
    
    if (!consultationData) return;

    setMealDistribution(prev => ({
      ...prev,
      [mealKey]: {
        ...prev[mealKey],
        percentage: percentValue,
        percent: percentValue, // Legacy compatibility
        calories: Math.round((percentValue / 100) * consultationData.totalCalories),
        protein: Math.round((percentValue / 100) * consultationData.protein),
        carbs: Math.round((percentValue / 100) * consultationData.carbs),
        fat: Math.round((percentValue / 100) * consultationData.fats),
        totalCalories: Math.round((percentValue / 100) * consultationData.totalCalories),
        totalProtein: Math.round((percentValue / 100) * consultationData.protein),
        totalCarbs: Math.round((percentValue / 100) * consultationData.carbs),
        totalFats: Math.round((percentValue / 100) * consultationData.fats),
        suggestions: prev[mealKey]?.suggestions || []
      }
    }));
  };

  const addMeal = () => {
    const mealKeys = Object.keys(mealDistribution);
    const nextMealNumber = mealKeys.length + 1;
    const mealKey = `meal${nextMealNumber}`;
    
    setMealDistribution(prev => ({
      ...prev,
      [mealKey]: {
        id: mealKey,
        name: `Refeição ${nextMealNumber}`,
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
      }
    }));
  };

  const removeMeal = (mealKey: string) => {
    setMealDistribution(prev => {
      const newDistribution = { ...prev };
      delete newDistribution[mealKey];
      return newDistribution;
    });
  };

  const totalDistributionPercentage = Object.values(mealDistribution)
    .reduce((total, meal) => total + meal.percentage, 0) / 100;

  return {
    mealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};
