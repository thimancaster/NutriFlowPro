
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import StepIndicator from '@/components/StepWizard/StepIndicator';
import { useSafeConsultation } from '@/hooks/useSafeConsultation';

interface ConsultationHeaderProps {
  currentStep?: string; // Making currentStep optional
}

const ConsultationHeader = ({ currentStep = 'dashboard' }: ConsultationHeaderProps) => {
  const navigate = useNavigate();
  const { activePatient } = useSafeConsultation();

  // Define the steps in the consultation process
  const STEPS = [
    'Dados do Paciente',
    'Consulta',
    'Plano Alimentar',
    'Finalização'
  ];

  // Determine the current step index
  let currentStepIndex = 0;
  
  switch (currentStep) {
    case 'patients':
      currentStepIndex = 0;
      break;
    case 'consultation':
      currentStepIndex = 1;
      break;
    case 'meal-plan':
      currentStepIndex = 2;
      break;
    case 'finalization':
      currentStepIndex = 3;
      break;
    default:
      currentStepIndex = 0;
  }

  const handleStepClick = (index: number) => {
    // Only allow navigation to previous steps
    if (index < currentStepIndex) {
      switch (index) {
        case 0:
          navigate('/patients');
          break;
        case 1:
          navigate('/consultation');
          break;
        case 2:
          navigate('/meal-plan-generator');
          break;
        default:
          break;
      }
    }
  };

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardContent className="pt-4">
        <StepIndicator 
          steps={STEPS} 
          currentStep={currentStepIndex}
          onStepClick={handleStepClick}
        />
        
        {activePatient && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Paciente atual: <span className="font-medium text-nutri-blue">{activePatient.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationHeader;
