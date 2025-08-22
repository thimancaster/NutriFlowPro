import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import MealPlanGenerationForm from './MealPlanGenerationForm';
import MealPlanDisplay from './MealPlanDisplay';

// Remove local WorkflowStep type definition to use the one from context
const MealPlanWorkflow: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    mealPlan,
    setMealPlan,
    generationParams,
    setGenerationParams,
    resetWorkflow
  } = useMealPlanWorkflow();

  const handleGenerateMealPlan = () => {
    setCurrentStep('display');
  };

  const handleEditGenerationParams = () => {
    setCurrentStep('generation');
  };

  const handleEditMealPlan = () => {
    setCurrentStep('editing' as import('@/contexts/MealPlanWorkflowContext').WorkflowStep);
  };

  const handleReset = () => {
    resetWorkflow();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow do Plano Alimentar</CardTitle>
        <CardDescription>
          Gerar, editar e visualizar o plano alimentar do paciente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === 'generation' && (
          <MealPlanGenerationForm onGenerate={handleGenerateMealPlan} />
        )}

        {currentStep === 'display' && mealPlan && (
          <MealPlanDisplay
            mealPlan={mealPlan}
            onEdit={handleEditMealPlan}
            onEditParams={handleEditGenerationParams}
          />
        )}

        {currentStep !== 'generation' && (
          <Button variant="outline" onClick={handleReset}>
            Voltar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanWorkflow;
