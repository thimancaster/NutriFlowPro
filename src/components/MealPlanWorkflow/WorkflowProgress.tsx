
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Utensils, Edit, CheckCircle } from 'lucide-react';

interface WorkflowProgressProps {
  currentStep: 'calculation' | 'generation' | 'editing' | 'completed';
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 'calculation', label: 'Cálculo', icon: Calculator },
    { id: 'generation', label: 'Geração', icon: Utensils },
    { id: 'editing', label: 'Edição', icon: Edit },
    { id: 'completed', label: 'Concluído', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                  ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                  ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-2">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-0.5 w-16 ${
                    index < currentIndex ? 'bg-green-600' : 'bg-gray-300'
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
