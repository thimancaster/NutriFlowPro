
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateMealPlanData } from '@/utils/mealGeneratorUtils';

export interface MealGeneratorSettings {
  numMeals: string;
  totalCalories: string;
  dietType: string;
  restrictions: string[];
}

export const useMealGeneratorState = () => {
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [generatorSettings, setGeneratorSettings] = useState<MealGeneratorSettings>({
    numMeals: '6', // Default to 6 meals
    totalCalories: '2000',
    dietType: 'balanced',
    restrictions: [] as string[]
  });

  const handleSettingsChange = (settings: Partial<MealGeneratorSettings>) => {
    setGeneratorSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  const generateMealPlan = () => {
    const plan = generateMealPlanData(
      generatorSettings.numMeals,
      generatorSettings.totalCalories,
      generatorSettings.dietType,
      generatorSettings.restrictions
    );
    
    setMealPlan(plan);
    
    toast({
      title: "Plano Alimentar Gerado",
      description: `Plano com ${generatorSettings.numMeals} refeições e ${generatorSettings.totalCalories} calorias criado.`,
    });
  };

  return {
    mealPlan,
    generatorSettings,
    handleSettingsChange,
    generateMealPlan
  };
};
