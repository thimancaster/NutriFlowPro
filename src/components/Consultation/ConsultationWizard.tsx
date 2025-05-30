
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StepIndicator from '@/components/StepWizard/StepIndicator';
import { useConsultation } from '@/contexts/ConsultationContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-states';

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
  const { consultationData } = useConsultation();
  const { activePatient } = usePatient();
  
  const navigationOperation = useAsyncOperation({
    errorMessage: 'Erro ao navegar entre etapas'
  });

  // Validate current step permissions
  const validateStepAccess = (targetStep: number): boolean => {
    switch (targetStep) {
      case 0: // Patient selection
        return true;
      case 1: // Consultation
        return !!activePatient;
      case 2: // Meal plan
        return !!activePatient && !!consultationData;
      case 3: // Finalization
        return !!activePatient && !!consultationData;
      default:
        return false;
    }
  };

  const handleBack = async () => {
    if (onBack) {
      onBack();
      return;
    }

    await navigationOperation.execute(async () => {
      switch (currentStep) {
        case 1:
          navigate('/patients');
          break;
        case 2:
          if (consultationData) {
            navigate('/consultation');
          } else {
            navigate('/patients');
          }
          break;
        case 3:
          navigate('/meal-plan-generator');
          break;
        default:
          navigate('/dashboard');
          break;
      }
    });
  };

  const handleNext = async () => {
    if (onNext) {
      onNext();
      return;
    }

    await navigationOperation.execute(async () => {
      switch (currentStep) {
        case 0:
          if (!activePatient) {
            toast({
              title: "Nenhum paciente selecionado",
              description: "Por favor, selecione um paciente primeiro",
              variant: "destructive"
            });
            return;
          }
          navigate('/consultation');
          break;
        case 1:
          if (!consultationData) {
            toast({
              title: "Dados de consulta incompletos",
              description: "Complete os dados da consulta antes de prosseguir",
              variant: "destructive"
            });
            return;
          }
          navigate('/meal-plan-generator');
          break;
        case 2:
          if (activePatient?.id) {
            navigate(`/patient-history/${activePatient.id}`);
          } else {
            navigate('/meal-plans');
          }
          break;
        default:
          navigate('/dashboard');
          break;
      }
    });
  };

  const handleStepClick = async (stepIndex: number) => {
    if (!validateStepAccess(stepIndex)) {
      toast({
        title: "Acesso negado",
        description: "Complete as etapas anteriores primeiro",
        variant: "destructive"
      });
      return;
    }

    if (onStepChange) {
      onStepChange(stepIndex);
      return;
    }
    
    await navigationOperation.execute(async () => {
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
        case 3:
          if (activePatient?.id) {
            navigate(`/patient-history/${activePatient.id}`);
          }
          break;
        default:
          break;
      }
    });
  };

  // Show loading state when navigating
  if (navigationOperation.isLoading) {
    return (
      <div className="w-full">
        <StepIndicator 
          steps={WIZARD_STEPS} 
          currentStep={currentStep} 
          onStepClick={() => {}} // Disabled during navigation
        />
        <LoadingSpinner text="Navegando..." className="py-12" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <StepIndicator 
        steps={WIZARD_STEPS} 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
      />
      
      <div className="my-6">
        {isLoading ? (
          <LoadingSpinner text="Carregando dados..." className="py-12" />
        ) : (
          children
        )}
      </div>
      
      {showStepButtons && !isLoading && (
        <div className="flex justify-between mt-6">
          {!hideBackButton && (
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={!canGoBack || navigationOperation.isLoading}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButtonLabel}
            </Button>
          )}
          
          {!hideNextButton && (
            <Button 
              onClick={handleNext}
              disabled={!canGoNext || navigationOperation.isLoading}
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
