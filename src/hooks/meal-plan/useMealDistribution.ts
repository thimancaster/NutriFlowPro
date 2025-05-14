
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MealDistributionItem } from '@/types';

const DEFAULT_MEAL_DISTRIBUTION = [
  { 
    id: 'breakfast',
    name: 'Café da Manhã', 
    percent: 0.25, 
    protein: 0, 
    carbs: 0, 
    fat: 0, 
    calories: 0,
    suggestions: []
  },
  { 
    id: 'lunch',
    name: 'Almoço', 
    percent: 0.30, 
    protein: 0, 
    carbs: 0, 
    fat: 0, 
    calories: 0,
    suggestions: []
  },
  { 
    id: 'dinner',
    name: 'Jantar', 
    percent: 0.25, 
    protein: 0, 
    carbs: 0, 
    fat: 0, 
    calories: 0,
    suggestions: []
  },
  { 
    id: 'snack',
    name: 'Lanche', 
    percent: 0.20, 
    protein: 0, 
    carbs: 0, 
    fat: 0, 
    calories: 0,
    suggestions: []
  }
];

export const useMealDistribution = (initialDistribution = [], consultationData = null) => {
  // Define initial meal distribution if not provided
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(() => {
    if (initialDistribution && initialDistribution.length > 0) {
      return initialDistribution.map(meal => ({
        ...meal,
        id: meal.id || uuidv4(),
        percent: meal.percentage ? meal.percentage / 100 : meal.percent || 0,
      }));
    }
    return DEFAULT_MEAL_DISTRIBUTION;
  });

  // Calculate total distribution percentage
  const totalDistributionPercentage = mealDistribution.reduce(
    (total, meal) => total + meal.percent, 
    0
  );

  // Handle meal percentage change
  const handleMealPercentChange = (mealId: string, newPercent: number) => {
    const updatedDistribution = mealDistribution.map(meal => {
      if (meal.id === mealId) {
        // Calculate the new percentage value
        const newValue = newPercent / 100;
        
        return { 
          ...meal, 
          percent: newValue,
          // Update the calories distribution if consultation data available
          calories: consultationData?.results?.vet ? consultationData.results.vet * newValue : meal.calories
        };
      }
      return meal;
    });
    
    setMealDistribution(updatedDistribution);
  };

  // Add a new meal to the distribution
  const addMeal = () => {
    const newMeal: MealDistributionItem = {
      id: uuidv4(),
      name: 'Nova Refeição',
      percent: 0.1, // Default 10%
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      suggestions: []
    };
    
    setMealDistribution([...mealDistribution, newMeal]);
  };
  
  // Remove a meal from the distribution
  const removeMeal = (mealId: string) => {
    const updatedDistribution = mealDistribution.filter(meal => meal.id !== mealId);
    setMealDistribution(updatedDistribution);
  };

  return {
    mealDistribution,
    setMealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};
