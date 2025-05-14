
import { useState, useEffect } from 'react';
import { MealDistributionItem, ConsultationData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useMealDistribution = (
  initialDistribution: MealDistributionItem[] = [],
  consultationData: ConsultationData | null
) => {
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(
    initialDistribution.length > 0 
      ? initialDistribution 
      : [
          { id: uuidv4(), name: 'Café da manhã', percentage: 0.25 },
          { id: uuidv4(), name: 'Lanche da manhã', percentage: 0.1 },
          { id: uuidv4(), name: 'Almoço', percentage: 0.3 },
          { id: uuidv4(), name: 'Lanche da tarde', percentage: 0.1 },
          { id: uuidv4(), name: 'Jantar', percentage: 0.25 }
        ]
  );

  // Calculate total percentage
  const totalDistributionPercentage = mealDistribution.reduce(
    (total, meal) => total + meal.percentage,
    0
  );

  // Handle percentage change for a specific meal
  const handleMealPercentChange = (id: string, newValue: number) => {
    setMealDistribution(prev => 
      prev.map(meal => 
        meal.id === id ? { ...meal, percentage: newValue / 100 } : meal
      )
    );
  };

  // Add a new meal
  const addMeal = () => {
    const newMeal: MealDistributionItem = {
      id: uuidv4(),
      name: `Refeição ${mealDistribution.length + 1}`,
      percentage: 0.0
    };
    setMealDistribution(prev => [...prev, newMeal]);
  };

  // Remove a meal
  const removeMeal = (id: string) => {
    setMealDistribution(prev => prev.filter(meal => meal.id !== id));
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
