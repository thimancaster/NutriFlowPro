
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Users, Calculator, Utensils, FileText } from 'lucide-react';

type WorkflowStep = 'patient' | 'nutritional' | 'generation' | 'mealPlan' | 'completed';

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ currentStep }) => {
  const steps = [
    {
      id: 'patient' as WorkflowStep,
      name: 'Paciente',
      description: 'Selecionar paciente',
      icon: Users
    },
    {
      id: 'nutritional' as WorkflowStep,
      name: 'Cálculo',
      description: 'Necessidades nutricionais',
      icon: Calculator
    },
    {
      id: 'generation' as WorkflowStep,
      name: 'Geração',
      description: 'Gerar plano alimentar',
      icon: Utensils
    },
    {
      id: 'mealPlan' as WorkflowStep,
      name: 'Edição',
      description: 'Personalizar plano',
      icon: FileText
    },
    {
      id: 'completed' as WorkflowStep,
      name: 'Concluído',
      description: 'Plano finalizado',
      icon: CheckCircle
    }
  ];

  const getStepStatus = (stepId: WorkflowStep) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${status === 'completed' 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : status === 'current'
                      ? 'bg-blue-100 border-blue-500 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      status === 'current' ? 'text-blue-600' : 
                      status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowProgress;
