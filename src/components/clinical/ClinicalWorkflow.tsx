
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ConsultationData } from '@/types/consultation';
import { ClinicalWorkflowStep } from '@/types/clinical';
import PatientSelectionStep from './PatientSelectionStep';
import PatientInfoStep from './PatientInfoStep';
import WorkflowHeader from './WorkflowHeader';
import { WorkflowSteps } from './WorkflowSteps';

const ClinicalWorkflow: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { activePatient, loadPatientById } = usePatient();
  
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>('patient-selection');
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load patient from URL params if needed
  React.useEffect(() => {
    if (patientId && !activePatient) {
      loadPatientById(patientId);
      setCurrentStep('patient-info');
    }
  }, [patientId, activePatient, loadPatientById]);
  
  // Handle step change from workflow header tabs
  const handleStepChange = (step: string) => {
    setCurrentStep(step as ClinicalWorkflowStep);
  };
  
  // Handle save action
  const handleSave = () => {
    setIsSaving(true);
    // Implement save logic here
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6">
      <WorkflowHeader
        patient={activePatient}
        consultation={consultation}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSave={handleSave}
        isSaving={isSaving}
      />
      
      <WorkflowSteps 
        currentStep={currentStep}
        patient={activePatient}
        consultation={consultation}
        setConsultation={setConsultation}
      />
    </div>
  );
};

export default ClinicalWorkflow;
