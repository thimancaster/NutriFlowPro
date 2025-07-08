
import React from 'react';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { Check, User, Ruler, Calculator, Utensils, FileText, CalendarCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';
import { useConsultationData } from '@/contexts/ConsultationDataContext';

interface WorkflowStepProps {
  step: ClinicalWorkflowStep;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  disabled: boolean;
  isOptional?: boolean;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  label,
  icon,
  isActive,
  isCompleted,
  onClick,
  disabled,
  isOptional = false
}) => {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 py-3 px-4 rounded-md transition-all duration-200 text-left",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isActive 
          ? "bg-nutri-green/20 text-nutri-green border-l-4 border-nutri-green shadow-sm" 
          : "hover:bg-muted",
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        isCompleted ? "text-muted-foreground bg-muted/30" : ""
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={cn(
        "rounded-full p-2 transition-all duration-200",
        isActive ? "bg-nutri-green text-white shadow-md" : "bg-muted text-muted-foreground",
        isCompleted ? "bg-green-500 text-white" : "",
        !disabled && !isActive && "group-hover:bg-primary/10"
      )}>
        {isCompleted ? <Check className="h-4 w-4" /> : icon}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium flex items-center gap-2">
          {label}
          {isOptional && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              opcional
            </span>
          )}
        </span>
      </div>
      {isCompleted && (
        <Check className="h-4 w-4 text-green-500" />
      )}
    </button>
  );
};

interface WorkflowStepsProps {
  currentStep: ClinicalWorkflowStep;
  patient: Patient | null;
  consultation: ConsultationData | null;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ 
  currentStep, 
  patient, 
  consultation
}) => {
  const { setCurrentStep } = useConsultationData();
  
  const steps: { 
    step: ClinicalWorkflowStep; 
    label: string; 
    icon: React.ReactNode; 
    completable: boolean;
    optional?: boolean;
  }[] = [
    { step: 'patient-selection', label: 'Seleção de Paciente', icon: <User className="h-4 w-4" />, completable: true },
    { step: 'patient-info', label: 'Dados do Paciente', icon: <User className="h-4 w-4" />, completable: true },
    { step: 'anthropometry', label: 'Antropometria', icon: <Activity className="h-4 w-4" />, completable: false, optional: true },
    { step: 'nutritional-evaluation', label: 'Avaliação Nutricional', icon: <Calculator className="h-4 w-4" />, completable: false },
    { step: 'meal-plan', label: 'Plano Alimentar', icon: <Utensils className="h-4 w-4" />, completable: false },
    { step: 'recommendations', label: 'Recomendações', icon: <FileText className="h-4 w-4" />, completable: false },
    { step: 'follow-up', label: 'Agendamento', icon: <CalendarCheck className="h-4 w-4" />, completable: false },
  ];
  
  // Determine which steps are completed
  const currentStepIndex = steps.findIndex(s => s.step === currentStep);
  
  // Determine which steps can be clicked
  const canClickStep = (stepIndex: number, step: ClinicalWorkflowStep) => {
    // Always allow clicking on patient selection
    if (step === 'patient-selection') return true;
    
    // For other steps, need a patient selected
    if (!patient) return false;
    
    // Allow clicking on completed steps and current step
    if (stepIndex <= currentStepIndex) return true;
    
    // Allow clicking on next step if current requirements are met
    if (stepIndex === currentStepIndex + 1) {
      switch (currentStep) {
        case 'patient-selection':
          return !!patient;
        case 'patient-info':
          return !!patient;
        case 'anthropometry':
          return true; // Optional step
        case 'nutritional-evaluation':
          return !!(consultation?.results);
        case 'meal-plan':
          return !!(consultation?.results);
        case 'recommendations':
          return true;
        default:
          return false;
      }
    }
    
    return false;
  };
  
  const handleStepClick = (step: ClinicalWorkflowStep, stepIndex: number) => {
    if (canClickStep(stepIndex, step)) {
      setCurrentStep(step);
    }
  };
  
  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
      <div className="space-y-2">
        {steps.map((step, index) => (
          <WorkflowStep
            key={step.step}
            step={step.step}
            label={step.label}
            icon={step.icon}
            isActive={currentStep === step.step}
            isCompleted={index < currentStepIndex && step.completable}
            onClick={() => handleStepClick(step.step, index)}
            disabled={!canClickStep(index, step.step)}
            isOptional={step.optional}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowSteps;
