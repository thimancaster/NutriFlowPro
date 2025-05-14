
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MealGeneratorSettings from './MealPlan/MealGeneratorSettings';
import MealGeneratorResults from './MealPlan/MealGeneratorResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMealGeneratorState } from '@/hooks/useMealGeneratorState';
import { logger } from '@/utils/logger';

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

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
