
import React, { useCallback } from 'react';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import ConsultationFormWrapper from '@/components/Consultation/ConsultationFormWrapper';
import { useConsultationLoader } from '@/hooks/useConsultationLoader';
import { useConsultationFormHandler } from '@/hooks/useConsultationFormHandler';
import { ConsultationError, ConsultationLoading, ConsultationNotFound } from '@/components/Consultation/ConsultationStateDisplay';

const Consultation: React.FC = () => {
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
    formData,
    setFormData,
    step,
    setStep,
    autoSaveStatus: formAutoSaveStatus,
    isSubmitting,
    handleFormSubmit,
    handleFormChange,
    handleStepChange,
    handleSaveConsultationClick
  } = useConsultationFormHandler(consultationId, consultation);

  // Map autoSaveStatus to expected type - fix the comparison
  const autoSaveStatus: 'idle' | 'saving' | 'success' | 'error' = 
    formAutoSaveStatus === 'success' ? 'success' : formAutoSaveStatus;
  
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

  const handleSaveConsultation = useCallback(async () => {
    if (formData) {
      await handleSaveConsultationClick(formData);
    }
  }, [formData, handleSaveConsultationClick]);

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
            onSave={handleSaveConsultation}
            isSaving={isSubmitting}
          />
        )}
      </ConsultationWizard>
    </div>
  );
};

export default Consultation;
