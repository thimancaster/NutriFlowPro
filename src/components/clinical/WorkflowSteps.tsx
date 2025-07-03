
import React from 'react';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { Check, User, Ruler, Calculator, Utensils, FileText, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';

interface WorkflowStepProps {
  step: ClinicalWorkflowStep;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  disabled: boolean;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  label,
  icon,
  isActive,
  isCompleted,
  onClick,
  disabled
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all",
        isActive 
          ? "bg-nutri-green/20 text-nutri-green border-l-4 border-nutri-green" 
          : "hover:bg-muted",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        isCompleted ? "text-muted-foreground" : ""
      )}
      onClick={() => !disabled && onClick()}
    >
      <div className={cn(
        "rounded-full p-1",
        isActive ? "bg-nutri-green text-white" : "bg-muted text-muted-foreground",
        isCompleted ? "bg-muted-foreground/20" : ""
      )}>
        {isCompleted ? <Check className="h-4 w-4" /> : icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      {isCompleted && (
        <Check className="h-4 w-4 ml-auto text-muted-foreground" />
      )}
    </div>
  );
};

interface WorkflowStepsProps {
  currentStep: ClinicalWorkflowStep;
  patient: Patient | null;
  consultation: ConsultationData | null;
  setConsultation: (consultation: ConsultationData | null) => void;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ 
  currentStep, 
  patient, 
  consultation,
  setConsultation
}) => {
  const steps: { step: ClinicalWorkflowStep; label: string; icon: React.ReactNode; completable: boolean }[] = [
    { step: 'patient-selection', label: 'Seleção de Paciente', icon: <User className="h-4 w-4" />, completable: true },
    { step: 'patient-info', label: 'Dados do Paciente', icon: <User className="h-4 w-4" />, completable: true },
    { step: 'anthropometry', label: 'Antropometria', icon: <Ruler className="h-4 w-4" />, completable: false },
    { step: 'nutritional-evaluation', label: 'Avaliação Nutricional', icon: <Calculator className="h-4 w-4" />, completable: false },
    { step: 'meal-plan', label: 'Plano Alimentar', icon: <Utensils className="h-4 w-4" />, completable: false },
    { step: 'recommendations', label: 'Recomendações', icon: <FileText className="h-4 w-4" />, completable: false },
    { step: 'follow-up', label: 'Agendamento', icon: <CalendarCheck className="h-4 w-4" />, completable: false },
  ];
  
  // Determine which steps are completed
  const currentStepIndex = steps.findIndex(s => s.step === currentStep);
  
  // Determine which steps can be clicked (only previous steps and current step)
  const canClickStep = (stepIndex: number) => {
    if (!consultation) return stepIndex === 0;
    return stepIndex <= currentStepIndex;
  };
  
  // Set the current step - placeholder for now, should be passed as prop
  const setCurrentStep = (step: ClinicalWorkflowStep) => {
    console.log("Changing step to:", step);
    // This would be implemented through props or context
    // For now, we just log the step change
  };
  
  return (
    <div className="bg-card rounded-md border p-2 mb-6">
      <div className="space-y-1">
        {steps.map((step, index) => (
          <WorkflowStep
            key={step.step}
            step={step.step}
            label={step.label}
            icon={step.icon}
            isActive={currentStep === step.step}
            isCompleted={index < currentStepIndex && step.completable}
            onClick={() => setCurrentStep(step.step)}
            disabled={!canClickStep(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowSteps;
