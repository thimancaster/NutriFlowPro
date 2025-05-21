
import { useState } from 'react';
import { ConsultationData } from '@/types';
import { useAutoSave } from '@/pages/ConsultationHooks/useAutoSave';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';
import usePatientData from '@/pages/ConsultationHooks/usePatientData';

// Wrapper for updatePatientData to match expected signature
const patientDataUpdateWrapper = async (
  patientId: string, 
  updateData: any
): Promise<void> => {
  const { updatePatientData } = usePatientData();
  await updatePatientData(patientId, updateData);
};

export function useConsultationFormHandler(consultationId?: string, consultation?: ConsultationData | null) {
  const [step, setStep] = useState(1);
  const { saveConsultation, autoSaveStatus } = useAutoSave(consultationId);
  const { handleSaveConsultation, isSubmitting } = useSaveConsultation();
  
  const handleFormChange = (data: Partial<ConsultationData>) => {
    if (!consultation) return;
    
    console.log("Form changed with data:", {
      weight: data.weight,
      height: data.height,
      age: data.age,
      activity_level: data.activity_level
    });
    
    const updatedConsultation = {
      ...consultation,
      ...data,
    };
    
    // Auto-save when changes are made
    saveConsultation(updatedConsultation);
    
    return updatedConsultation;
  };
  
  const handleStepChange = (newStep: number) => {
    console.log("Changing step from", step, "to", newStep);
    setStep(newStep);
  };
  
  const handleSaveConsultationClick = async () => {
    if (!consultation) return;
    console.log("Saving consultation:", consultation.id);
    
    await handleSaveConsultation(
      consultationId || '', 
      consultation, 
      patientDataUpdateWrapper
    );
  };
  
  return {
    step,
    autoSaveStatus,
    isSubmitting,
    handleFormChange,
    handleStepChange,
    handleSaveConsultationClick
  };
}
