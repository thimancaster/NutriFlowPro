
import React from 'react';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import ConsultationFormWrapper from '@/components/Consultation/ConsultationFormWrapper';
import { useConsultationLoader } from '@/hooks/useConsultationLoader';
import { useConsultationFormHandler } from '@/hooks/useConsultationFormHandler';
import { ConsultationError, ConsultationLoading, ConsultationNotFound } from '@/components/Consultation/ConsultationStateDisplay';

const Consultation = () => {
  const { 
    consultation, 
    setConsultation,
    patient,
    patients,
    isLoading,
    error,
    consultationId
  } = useConsultationLoader();
  
  const {
    step,
    autoSaveStatus,
    isSubmitting,
    handleFormChange,
    handleStepChange,
    handleSaveConsultationClick
  } = useConsultationFormHandler(consultationId, consultation);
  
  // Handle loading and error states
  if (isLoading) {
    return <ConsultationLoading />;
  }
  
  if (error) {
    return <ConsultationError error={error} />;
  }
  
  if (!consultation) {
    return <ConsultationNotFound />;
  }
  
  // Handle form changes with state updates
  const onFormChange = (data: Partial<typeof consultation>) => {
    const updatedConsultation = handleFormChange(data);
    if (updatedConsultation) {
      setConsultation(updatedConsultation);
    }
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
            onFormChange={onFormChange}
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
