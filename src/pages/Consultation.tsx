
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import { ConsultationData } from '@/types';
import ConsultationFormWrapper from '@/components/Consultation/ConsultationFormWrapper';
import { useConsultationData } from '@/hooks/useConsultationData';
import { useConsultationPatient } from '@/hooks/patient/useConsultationPatient';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';
import useAutoSave from './ConsultationHooks/useAutoSave';
import usePatientData from './ConsultationHooks/usePatientData';

// Wrapper for updatePatientData to match expected signature
const patientDataUpdateWrapper = async (
  patientId: string, 
  updateData: any
): Promise<void> => {
  const { updatePatientData } = usePatientData();
  await updatePatientData(patientId, updateData);
}

const Consultation = () => {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState(1);
  
  // Custom hooks
  const { consultation, setConsultation, isLoading } = useConsultationData(id);
  const { patient, patients } = useConsultationPatient(consultation?.patient_id);
  const { saveConsultation, autoSaveStatus } = useAutoSave(id);
  const { updatePatientData } = usePatientData();
  const { handleSaveConsultation, isSubmitting } = useSaveConsultation();
  
  const handleFormChange = (data: Partial<ConsultationData>) => {
    if (!consultation) return;
    
    const updatedConsultation = {
      ...consultation,
      ...data,
    };
    
    setConsultation(updatedConsultation);
    
    // Auto-save when changes are made
    saveConsultation(updatedConsultation);
  };
  
  const handleStepChange = (newStep: number) => {
    setStep(newStep);
  };
  
  const handleSaveConsultationClick = async () => {
    if (!consultation) return;
    await handleSaveConsultation(id!, consultation, patientDataUpdateWrapper);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ConsultationWizard
        currentStep={step}
        onStepChange={handleStepChange}
        isLoading={isLoading}
      >
        {step === 1 && consultation && (
          <ConsultationFormWrapper
            consultation={consultation}
            onFormChange={handleFormChange}
            patient={patient}
            patients={patients}
            autoSaveStatus={autoSaveStatus}
          />
        )}
        
        {step === 2 && consultation && consultation.results && (
          <ConsultationResults
            results={consultation.results}
            onSave={handleSaveConsultationClick}
            isSaving={isSubmitting}
          />
        )}
      </ConsultationWizard>
    </div>
  );
};

export default Consultation;
