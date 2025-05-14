
import { useState, useEffect } from 'react';
import { MealDistributionItem } from '@/types/meal';
import { v4 as uuidv4 } from 'uuid';

interface UseMealDistributionProps {
  initialDistribution?: MealDistributionItem[];
  consultationData?: any;
}

export const useMealDistribution = (initialDistribution: MealDistributionItem[] = [], consultationData?: any) => {
  // Initialize meal distribution with default values or from saved state
  const [mealDistribution, setMealDistribution] = useState<MealDistributionItem[]>(
    initialDistribution.length > 0 ? initialDistribution : getDefaultMealDistribution()
  );
  
  // Calculate and track the total distribution percentage
  const [totalDistributionPercentage, setTotalDistributionPercentage] = useState(0);
  
  // Update total percentage when distribution changes
  useEffect(() => {
    const total = mealDistribution.reduce((sum, meal) => sum + (meal.percent || 0), 0) / 100;
    setTotalDistributionPercentage(total);
  }, [mealDistribution]);
  
  // Handle meal percentage change
  const handleMealPercentChange = (mealId: string, newPercent: number) => {
    setMealDistribution(prevMeals => 
      prevMeals.map(meal => 
        meal.id === mealId 
          ? { ...meal, percent: newPercent } 
          : meal
      )
    );
  };
  
  // Add a new meal to the distribution
  const addMeal = () => {
    const newMeal: MealDistributionItem = {
      id: uuidv4(),
      name: `Refeição ${mealDistribution.length + 1}`,
      percent: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      foods: [],
      suggestions: []
    };
    
    setMealDistribution(prevMeals => [...prevMeals, newMeal]);
  };
  
  // Remove a meal from the distribution
  const removeMeal = (mealId: string) => {
    setMealDistribution(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
  };
  
  // Default meal distribution setup
  function getDefaultMealDistribution(): MealDistributionItem[] {
    return [
      createDefaultMeal('Café da manhã', 25),
      createDefaultMeal('Lanche da manhã', 10),
      createDefaultMeal('Almoço', 30),
      createDefaultMeal('Lanche da tarde', 10),
      createDefaultMeal('Jantar', 20),
      createDefaultMeal('Ceia', 5)
    ];
  }
  
  // Helper function to create a default meal
  function createDefaultMeal(name: string, percent: number): MealDistributionItem {
    return {
      id: uuidv4(),
      name,
      percent,
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      foods: [],
      suggestions: []
    };
  }
  
  return {
    mealDistribution,
    setMealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};
