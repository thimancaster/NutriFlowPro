
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
          { 
            id: uuidv4(), 
            name: 'Café da manhã', 
            percent: 25,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            suggestions: []
          },
          { 
            id: uuidv4(), 
            name: 'Lanche da manhã', 
            percent: 10,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            suggestions: []
          },
          { 
            id: uuidv4(), 
            name: 'Almoço', 
            percent: 30,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            suggestions: []
          },
          { 
            id: uuidv4(), 
            name: 'Lanche da tarde', 
            percent: 10,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            suggestions: []
          },
          { 
            id: uuidv4(), 
            name: 'Jantar', 
            percent: 25,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            suggestions: []
          }
        ]
  );

  // Calculate total percentage
  const totalDistributionPercentage = mealDistribution.reduce(
    (total, meal) => total + (meal.percent / 100),
    0
  );

  // Handle percentage change for a specific meal
  const handleMealPercentChange = (id: string, newValue: number) => {
    setMealDistribution(prev => 
      prev.map(meal => 
        meal.id === id ? { ...meal, percent: newValue } : meal
      )
    );
  };

  // Add a new meal
  const addMeal = () => {
    const newMeal: MealDistributionItem = {
      id: uuidv4(),
      name: `Refeição ${mealDistribution.length + 1}`,
      percent: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      suggestions: []
    };
    setMealDistribution(prev => [...prev, newMeal]);
  };

  // Remove a meal
  const removeMeal = (id: string) => {
    setMealDistribution(prev => prev.filter(meal => meal.id !== id));
  };

  // Update nutritional values if consultation data changes
  useEffect(() => {
    if (consultationData?.results) {
      const { macros, get } = consultationData.results;
      
      setMealDistribution(prev => prev.map(meal => {
        const caloriesForMeal = (get * meal.percent) / 100;
        const proteinForMeal = (macros.protein * meal.percent) / 100;
        const carbsForMeal = (macros.carbs * meal.percent) / 100;
        const fatForMeal = (macros.fat * meal.percent) / 100;
        
        return {
          ...meal,
          calories: Math.round(caloriesForMeal),
          protein: Math.round(proteinForMeal),
          carbs: Math.round(carbsForMeal),
          fat: Math.round(fatForMeal)
        };
      }));
    }
  }, [consultationData, mealDistribution.map(m => m.percent).join(',')]);

  return {
    mealDistribution,
    setMealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  };
};
