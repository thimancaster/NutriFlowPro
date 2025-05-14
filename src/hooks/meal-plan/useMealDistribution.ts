
import { useState, useCallback } from 'react';
import { MealDistributionItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { MEAL_NAMES } from '@/utils/mealPlanUtils';

export const useMealDistribution = (initialDistribution?: MealDistributionItem[]) => {
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(
    initialDistribution || [
      {
        id: uuidv4(),
        name: MEAL_NAMES[0] || "Café da manhã",
        percentage: 0.25
      },
      {
        id: uuidv4(),
        name: MEAL_NAMES[1] || "Lanche da manhã",
        percentage: 0.15
      },
      {
        id: uuidv4(),
        name: MEAL_NAMES[2] || "Almoço",
        percentage: 0.30
      },
      {
        id: uuidv4(),
        name: MEAL_NAMES[3] || "Lanche da tarde",
        percentage: 0.15
      },
      {
        id: uuidv4(),
        name: MEAL_NAMES[4] || "Jantar",
        percentage: 0.15
      }
    ]
  );

  const totalDistributionPercentage = mealDistribution.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  const handleMealPercentChange = useCallback((id: string, value: number) => {
    setMealDistribution(prev => prev.map(meal => {
      if (meal.id === id) {
        return { ...meal, percentage: value / 100 };
      }
      return meal;
    }));
  }, []);

  const addMeal = useCallback(() => {
    const newMeal: MealDistributionItem = {
      id: uuidv4(),
      name: `Refeição ${mealDistribution.length + 1}`,
      percentage: 0.05
    };

    setMealDistribution(prev => [...prev, newMeal]);
  }, [mealDistribution.length]);

  const removeMeal = useCallback((id: string) => {
    setMealDistribution(prev => prev.filter(meal => meal.id !== id));
  }, []);

  return {
    mealDistribution,
    setMealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};

export default useMealDistribution;
