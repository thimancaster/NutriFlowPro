
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MealGeneratorSettings from '@/components/MealPlan/MealGeneratorSettings';
import MealGeneratorResults from '@/components/MealPlan/MealGeneratorResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMealGeneratorState } from '@/hooks/useMealGeneratorState';
import { logger } from '@/utils/logger';
import { MealDistributionItem } from '@/types/meal';
import { v4 as uuidv4 } from 'uuid';

/**
 * MealPlanGenerator component used for generating meal plans 
 * based on user settings
 */
const MealPlanGenerator = () => {
  const [activeTab, setActiveTab] = useState<string>('settings');
  
  const {
    mealPlan,
    generatorSettings,
    handleSettingsChange,
    generateMealPlan
  } = useMealGeneratorState();

  // Create default meal distribution items with all required properties
  const createDefaultMealItem = (name: string, percent: number = 0): MealDistributionItem => ({
    id: uuidv4(),
    name,
    percent,
    foods: [],
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0
  });

  // Initialize meal distribution with proper types
  const [mealDistribution, setMealDistribution] = useState<Record<string, MealDistributionItem>>({
    breakfast: createDefaultMealItem('Café da manhã', 25),
    morningSnack: createDefaultMealItem('Lanche da manhã', 10),
    lunch: createDefaultMealItem('Almoço', 30),
    afternoonSnack: createDefaultMealItem('Lanche da tarde', 10),
    dinner: createDefaultMealItem('Jantar', 20),
    eveningSnack: createDefaultMealItem('Ceia', 5)
  });

  // Calculate total meal percentage
  const getTotalMealPercent = (): number => {
    return Object.values(mealDistribution).reduce(
      (total, meal) => total + meal.percent, 
      0
    );
  };

  const [totalMealPercent, setTotalMealPercent] = useState<number>(getTotalMealPercent());

  // Update total percentage when meal distribution changes
  useEffect(() => {
    setTotalMealPercent(getTotalMealPercent());
  }, [mealDistribution]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle meal percentage change
  const handleMealPercentChange = (mealKey: string, newValue: number) => {
    const updatedDistribution = { ...mealDistribution };
    if (updatedDistribution[mealKey]) {
      updatedDistribution[mealKey] = {
        ...updatedDistribution[mealKey],
        percent: newValue
      };
      setMealDistribution(updatedDistribution);
    }
  };

  // Handle generate meal plan and switch to results tab
  const handleGenerateMealPlan = () => {
    logger.info('Generating meal plan with settings:', generatorSettings);
    generateMealPlan();
    
    if (mealPlan) {
      setActiveTab('result');
    }
  };

  return (
    <div>
      <Card className="nutri-card">
        <CardHeader>
          <CardTitle>Gerador de Planos Alimentares</CardTitle>
          <CardDescription>
            Crie um plano alimentar personalizado com base nas necessidades do paciente
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="result" disabled={!mealPlan}>Resultado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <MealGeneratorSettings 
                settings={generatorSettings}
                onSettingsChange={handleSettingsChange}
              />
            </TabsContent>
            
            <TabsContent value="result">
              {mealPlan && <MealGeneratorResults mealPlan={mealPlan} settings={generatorSettings} />}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleGenerateMealPlan}
            className="bg-nutri-green hover:bg-nutri-green-dark"
          >
            Gerar Plano Alimentar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MealPlanGenerator;
