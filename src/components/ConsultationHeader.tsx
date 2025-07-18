
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import StepIndicator from '@/components/StepWizard/StepIndicator';
import { useConsultationData } from '@/contexts/ConsultationDataContext';

interface ConsultationHeaderProps {
  currentStep?: string; // Making currentStep optional
}

const ConsultationHeader = ({ currentStep = 'dashboard' }: ConsultationHeaderProps) => {
  const navigate = useNavigate();
  
  // Use try-catch to handle contexts that might not be available
  let selectedPatient = null;
  try {
    const context = useConsultationData();
    selectedPatient = context.selectedPatient;
  } catch {
    // Context not available, use default values
    selectedPatient = null;
  }

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
    <Card className="mb-6 shadow-sm border border-border">
      <CardContent className="pt-4">
        <StepIndicator 
          steps={STEPS} 
          currentStep={currentStepIndex}
          onStepClick={handleStepClick}
        />
        
        {selectedPatient && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Paciente atual: <span className="font-medium text-nutri-blue">{selectedPatient.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationHeader;
