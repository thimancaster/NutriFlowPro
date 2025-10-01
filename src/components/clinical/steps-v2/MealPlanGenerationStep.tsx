/**
 * Meal Plan Generation Step for Clinical Workflow V2
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';

export const MealPlanGenerationStep: React.FC = () => {
  const { nextStep, previousStep } = useClinicalWorkflow();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geração de Plano Alimentar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Gerando plano alimentar personalizado...</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={previousStep}>
              Voltar
            </Button>
            <Button onClick={nextStep}>
              Avançar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerationStep;
