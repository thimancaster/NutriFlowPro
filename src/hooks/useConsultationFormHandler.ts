
import { useState, useCallback } from 'react';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';

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
    isSaving,
    handleSubmitConsultation,
    saveAutoChanges
  } = useSaveConsultation();

  const handleFormSubmit = useCallback(async (data: any) => {
    setAutoSaveStatus('saving');
    try {
      // Create a mock form event for the handler
      const mockEvent = {
        preventDefault: () => {},
        currentTarget: {}
      } as any;
      
      const result = await handleSubmitConsultation(
        mockEvent,
        data,
        {},
        consultationId || '',
        () => {}
      );
      setAutoSaveStatus('saved');
      return result;
    } catch (error) {
      setAutoSaveStatus('error');
      throw error;
    }
  }, [consultationId, handleSubmitConsultation]);

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
      await saveAutoChanges(consultationId, data, {});
    }
  }, [consultationId, saveAutoChanges]);

  return {
    formData,
    setFormData,
    step,
    setStep,
    autoSaveStatus,
    isSubmitting: isSaving,
    handleFormSubmit,
    handleFormChange,
    handleStepChange,
    handleSaveConsultationClick
  };
};
