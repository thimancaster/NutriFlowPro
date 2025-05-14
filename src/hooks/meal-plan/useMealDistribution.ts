
import { useState, useEffect } from 'react';
import { MealDistributionItem, ConsultationData } from '@/types';

interface UseMealDistributionProps {
  initialDistribution: MealDistributionItem[];
  consultationData: ConsultationData | null;
}

export const useMealDistribution = ({ 
  initialDistribution = [], 
  consultationData 
}: UseMealDistributionProps) => {
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(initialDistribution);
  
  // Initialize meal distribution if none is provided
  useEffect(() => {
    if (mealDistribution.length === 0) {
      // Create default meal distribution if none exists
      setMealDistribution([
        { id: 'breakfast', name: 'Café da manhã', percent: 25 },
        { id: 'lunch', name: 'Almoço', percent: 30 },
        { id: 'snack', name: 'Lanche', percent: 15 },
        { id: 'dinner', name: 'Jantar', percent: 30 }
      ]);
    }
  }, [mealDistribution.length]);
  
  // Calculate total percentage of all meals
  const totalMealPercent = mealDistribution.reduce((sum, meal) => sum + meal.percent, 0);
  
  // Handle changing the percent for a meal
  const handleMealPercentChange = (id: string, value: number) => {
    setMealDistribution(prev => 
      prev.map(meal => 
        meal.id === id ? { ...meal, percent: value } : meal
      )
    );
  };
  
  // Add a new meal
  const addMeal = () => {
    const id = `meal-${mealDistribution.length + 1}`;
    setMealDistribution(prev => [
      ...prev,
      { id, name: `Refeição ${mealDistribution.length + 1}`, percent: 0 }
    ]);
  };
  
  // Remove a meal
  const removeMeal = (id: string) => {
    setMealDistribution(prev => prev.filter(meal => meal.id !== id));
  };
  
  return {
    mealDistribution,
    totalMealPercent,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};
