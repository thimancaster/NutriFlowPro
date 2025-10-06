
/**
 * Página Principal do Workflow de Cálculo Nutricional
 * Implementa o fluxo sequencial de 3 etapas conforme especificação
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Calculator } from 'lucide-react';
import { NutritionWorkflowProvider, useNutritionWorkflow } from '@/contexts/NutritionWorkflowContext';
import { EnergyCalculationStep } from '@/components/workflow/EnergyCalculationStep';
import { MacroDefinitionStep } from '@/components/workflow/MacroDefinitionStep';
import { MealCompositionStep } from '@/components/workflow/MealCompositionStep';

const WorkflowContent: React.FC = () => {
  const { 
    currentStep, 
    canProceedToStep2, 
    canProceedToStep3, 
    isWorkflowComplete,
    resetWorkflow 
  } = useNutritionWorkflow();

  const steps = [
    {
      number: 1,
      title: 'Cálculo Energético',
      description: 'TMB, GET e VET baseados no perfil',
      completed: canProceedToStep2,
      active: currentStep === 1
    },
    {
      number: 2,
      title: 'Definição dos Macronutrientes',
      description: 'Proteína, lipídios e carboidratos',
      completed: canProceedToStep3,
      active: currentStep === 2
    },
    {
      number: 3,
      title: 'Montagem das Refeições',
      description: 'Seleção de alimentos e porções',
      completed: isWorkflowComplete,
      active: currentStep === 3
    }
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Cálculo Nutricional Completo
            </h1>
            <p className="text-muted-foreground">
              Workflow sequencial para cálculo preciso das necessidades nutricionais
            </p>
          </div>
          
          <button
            onClick={resetWorkflow}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Reiniciar Workflow
          </button>
        </div>
      </div>

      {/* Progress Header */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progresso do Workflow</span>
            <Badge variant={isWorkflowComplete ? "default" : "secondary"}>
              Etapa {currentStep} de {steps.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div 
                key={step.number}
                className={`p-4 rounded-lg border transition-colors ${
                  step.active 
                    ? 'border-blue-500 bg-blue-50' 
                    : step.completed 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className={`h-5 w-5 ${step.active ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Etapa {step.number}</span>
                    {step.active && <Badge variant="outline" className="text-xs">Atual</Badge>}
                    {step.completed && <Badge variant="default" className="text-xs bg-green-600">Concluída</Badge>}
                  </div>
                </div>
                <h3 className="font-medium mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && <EnergyCalculationStep />}
        {currentStep === 2 && <MacroDefinitionStep />}
        {currentStep === 3 && <MealCompositionStep />}
      </div>
    </div>
  );
};

const NutritionWorkflow: React.FC = () => {
  return (
    <NutritionWorkflowProvider>
      <WorkflowContent />
    </NutritionWorkflowProvider>
  );
};

export default NutritionWorkflow;
