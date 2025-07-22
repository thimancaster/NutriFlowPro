
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientSelectionStep from './PatientSelectionStep';
import EvaluationStep from './EvaluationStep';
import MealPlanStep from './MealPlanStep';
import ReviewStep from './ReviewStep';
import { useConsultation } from '@/contexts/ConsultationContext';

interface ClinicalWorkflowProps {
  patientId?: string;
}

const ClinicalWorkflow: React.FC<ClinicalWorkflowProps> = ({ patientId: initialPatientId }) => {
  const { currentStep, setCurrentStep, activePatient } = useConsultation();

  const steps = [
    { id: 'patient-selection', label: 'Paciente', component: PatientSelectionStep },
    { id: 'evaluation', label: 'Avaliação', component: EvaluationStep },
    { id: 'meal-plan', label: 'Plano Alimentar', component: MealPlanStep },
    { id: 'review', label: 'Revisão', component: ReviewStep },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as any);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as any);
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStepIndex];
    if (!currentStepData) return null;

    const StepComponent = currentStepData.component;
    
    // Provide required props based on the step
    const commonProps = {
      onNext: handleNext,
      onPrev: handlePrev,
    };

    switch (currentStep) {
      case 'patient-selection':
        return <StepComponent {...commonProps} initialPatientId={initialPatientId} />;
      case 'evaluation':
        return activePatient ? (
          <StepComponent {...commonProps} patientId={activePatient.id} />
        ) : null;
      case 'meal-plan':
        return activePatient ? (
          <StepComponent {...commonProps} patientId={activePatient.id} />
        ) : null;
      case 'review':
        return <StepComponent {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo Clínico</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              {steps.map((step, index) => (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id}
                  disabled={index > currentStepIndex + 1}
                >
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {steps.map((step) => (
              <TabsContent key={step.id} value={step.id} className="mt-6">
                {renderStepContent()}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalWorkflow;
