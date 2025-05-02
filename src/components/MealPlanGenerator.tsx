
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MealGeneratorSettings from './MealPlan/MealGeneratorSettings';
import MealGeneratorResults from './MealPlan/MealGeneratorResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMealGeneratorState } from '@/hooks/useMealGeneratorState';

const MealPlanGenerator = () => {
  const {
    mealPlan,
    generatorSettings,
    handleSettingsChange,
    generateMealPlan
  } = useMealGeneratorState();

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
          <Tabs defaultValue="settings">
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
            onClick={generateMealPlan}
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
