
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
    { id: 'patient-selection', label: 'Paciente' },
    { id: 'evaluation', label: 'Avaliação' },
    { id: 'meal-plan', label: 'Plano Alimentar' },
    { id: 'review', label: 'Revisão' },
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
    const commonProps = {
      onNext: handleNext,
      onPrev: handlePrev,
    };

    switch (currentStep) {
      case 'patient-selection':
        return (
          <PatientSelectionStep 
            {...commonProps} 
            initialPatientId={initialPatientId} 
          />
        );
      case 'evaluation':
        return activePatient ? (
          <EvaluationStep 
            {...commonProps} 
            patientId={activePatient.id} 
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Selecione um paciente primeiro</p>
          </div>
        );
      case 'meal-plan':
        return activePatient ? (
          <MealPlanStep 
            {...commonProps} 
            patientId={activePatient.id} 
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Selecione um paciente primeiro</p>
          </div>
        );
      case 'review':
        return <ReviewStep {...commonProps} />;
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
