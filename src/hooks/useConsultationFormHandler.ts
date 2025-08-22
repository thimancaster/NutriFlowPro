
import { useState, useCallback } from 'react';
import { useConsultation } from '@/hooks/useConsultation';

interface ConsultationFormHandlerReturn {
  formData: any;
  setFormData: (data: any) => void;
  step: number;
  setStep: (step: number) => void;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isSubmitting: boolean;
  handleFormSubmit: (data: any) => Promise<any>;
  handleFormChange: (data: any) => any;
  handleStepChange: (step: number) => void;
  handleSaveConsultationClick: (data: any) => Promise<void>;
}

export const useConsultationFormHandler = (
  consultationId?: string,
  consultation?: any
): ConsultationFormHandlerReturn => {
  const [formData, setFormData] = useState(consultation || {});
  const [step, setStep] = useState(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const { 
    createConsultation, 
    updateConsultation, 
    saveConsultation, 
    isLoading: isSubmitting 
  } = useConsultation();

  const handleFormSubmit = useCallback(async (data: any) => {
    setAutoSaveStatus('saving');
    try {
      let result;
      if (consultationId) {
        result = await updateConsultation(consultationId, data);
      } else {
        result = await createConsultation(data);
      }
      setAutoSaveStatus('saved');
      return result;
    } catch (error) {
      setAutoSaveStatus('error');
      throw error;
    }
  }, [consultationId, createConsultation, updateConsultation]);

  const handleFormChange = useCallback((data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    return updatedData;
  }, [formData]);

  const handleStepChange = useCallback((newStep: number) => {
    setStep(newStep);
  }, []);

  const handleSaveConsultationClick = useCallback(async (data: any) => {
    if (consultationId) {
      await saveConsultation(consultationId, data);
    }
  }, [consultationId, saveConsultation]);

  return {
    formData,
    setFormData,
    step,
    setStep,
    autoSaveStatus,
    isSubmitting,
    handleFormSubmit,
    handleFormChange,
    handleStepChange,
    handleSaveConsultationClick
  };
};
