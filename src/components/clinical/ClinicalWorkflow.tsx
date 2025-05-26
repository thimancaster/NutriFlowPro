
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ConsultationData } from '@/types/consultation';
import { ClinicalWorkflowStep } from '@/types/clinical';
import PatientSelectionStep from './PatientSelectionStep';
import PatientInfoStep from './PatientInfoStep';
import WorkflowHeader from './WorkflowHeader';
import WorkflowSteps from './WorkflowSteps'; 

const ClinicalWorkflow: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { activePatient, loadPatientById } = usePatient();
  
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>('patient-selection');
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Load patient from URL params if needed
  React.useEffect(() => {
    if (patientId && !activePatient) {
      loadPatientById(patientId);
      setCurrentStep('patient-info');
    }
  }, [patientId, activePatient, loadPatientById]);
  
  // Handle save action
  const handleSave = () => {
    setIsSaving(true);
    // Implement save logic here
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1000);
  };

  // Handle complete consultation
  const handleComplete = () => {
    // Implement complete logic here
    console.log('Completing consultation');
  };

  return (
    <div className="container mx-auto py-6">
      <WorkflowHeader
        activePatient={activePatient}
        activeConsultation={consultation}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={handleSave}
        onComplete={handleComplete}
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
