
import React from 'react';
import { useClinical } from '@/contexts/ClinicalContext';
import WorkflowHeader from './WorkflowHeader';
import WorkflowSteps from './WorkflowSteps';
import PatientSelectionStep from './PatientSelectionStep';
import PatientInfoStep from './PatientInfoStep';

const ClinicalWorkflow: React.FC = () => {
  const { currentStep, activePatient } = useClinical();
  
  // Render appropriate step component based on currentStep
  const renderStepComponent = () => {
    switch (currentStep) {
      case 'patient-selection':
        return <PatientSelectionStep />;
      case 'patient-info':
        return <PatientInfoStep />;
      case 'anthropometry':
        return <div>Antropometria (Em desenvolvimento)</div>;
      case 'nutritional-evaluation':
        return <div>Avaliação Nutricional (Em desenvolvimento)</div>;
      case 'meal-plan':
        return <div>Plano Alimentar (Em desenvolvimento)</div>;
      case 'recommendations':
        return <div>Recomendações (Em desenvolvimento)</div>;
      case 'follow-up':
        return <div>Agendamento (Em desenvolvimento)</div>;
      default:
        return <PatientSelectionStep />;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      {activePatient && <WorkflowHeader />}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <WorkflowSteps />
        </div>
        
        <div className="md:col-span-3">
          {renderStepComponent()}
        </div>
      </div>
    </div>
  );
};

export default ClinicalWorkflow;
