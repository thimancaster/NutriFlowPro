
import { useState, useCallback } from 'react';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';

interface ConsultationFormHandlerReturn {
  formData: any;
  setFormData: (data: any) => void;
  step: number;
  setStep: (step: number) => void;
  autoSaveStatus: 'idle' | 'saving' | 'success' | 'error';
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const { 
    isLoading,
    createConsultation,
    updateConsultation
  } = useSaveConsultation();

  const handleFormSubmit = useCallback(async (data: any) => {
    setAutoSaveStatus('saving');
    try {
      let result;
      if (consultationId) {
        result = await updateConsultation(consultationId, data);
      } else {
        result = await createConsultation(data);
      }
      setAutoSaveStatus('success');
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
      await updateConsultation(consultationId, data);
    }
  }, [consultationId, updateConsultation]);

  return {
    formData,
    setFormData,
    step,
    setStep,
    autoSaveStatus,
    isSubmitting: isLoading,
    handleFormSubmit,
    handleFormChange,
    handleStepChange,
    handleSaveConsultationClick
  };
};
