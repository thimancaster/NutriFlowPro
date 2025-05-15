
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StepIndicator from '@/components/StepWizard/StepIndicator';
import { useConsultation } from '@/contexts/ConsultationContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const WIZARD_STEPS = [
  'Dados do Paciente',
  'Consulta',
  'Plano Alimentar',
  'Finalização'
];

interface ConsultationWizardProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  hideBackButton?: boolean;
  hideNextButton?: boolean;
  backButtonLabel?: string;
  nextButtonLabel?: string;
  showStepButtons?: boolean;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const ConsultationWizard: React.FC<ConsultationWizardProps> = ({
  currentStep,
  onStepChange,
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  hideBackButton = false,
  hideNextButton = false,
  backButtonLabel = 'Voltar',
  nextButtonLabel = 'Avançar',
  showStepButtons = true,
  children,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activePatient } = useConsultation();

  // Get the consultation steps from context
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // Default navigation logic
    switch (currentStep) {
      case 1:
        // Go back to patient selection
        navigate('/patients');
        break;
      case 2:
        // Go back to consultation data
        navigate('/consultation');
        break;
      case 3:
        // Go back to meal plan generator
        navigate('/meal-plan-generator');
        break;
      default:
        break;
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
      return;
    }

    // Default navigation logic
    switch (currentStep) {
      case 0:
        // From patient selection to consultation
        if (activePatient) {
          navigate('/consultation');
        } else {
          toast({
            title: "Nenhum paciente selecionado",
            description: "Por favor, selecione um paciente primeiro",
            variant: "destructive"
          });
        }
        break;
      case 1:
        // From consultation to meal plan
        navigate('/meal-plan-generator');
        break;
      case 2:
        // From meal plan to finalization/history
        if (activePatient?.id) {
          navigate(`/patient-history/${activePatient.id}`);
        } else {
          navigate('/meal-plans');
        }
        break;
      default:
        break;
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (onStepChange) {
      onStepChange(stepIndex);
      return;
    }
    
    // Navigate directly to a completed step
    switch (stepIndex) {
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
  };

  return (
    <div className="w-full">
      <StepIndicator 
        steps={WIZARD_STEPS} 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
      />
      
      <div className="my-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-green"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {showStepButtons && (
        <div className="flex justify-between mt-6">
          {!hideBackButton && (
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={!canGoBack}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButtonLabel}
            </Button>
          )}
          
          {!hideNextButton && (
            <Button 
              onClick={handleNext}
              disabled={!canGoNext}
              className="bg-nutri-green hover:bg-nutri-green-dark ml-auto flex items-center"
            >
              {nextButtonLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationWizard;
