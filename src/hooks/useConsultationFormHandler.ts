
import { useState } from 'react';
import { useSaveConsultation } from './useSaveConsultation';
import { ConsultationCreateInput, ConsultationUpdateInput } from '@/types/consultationTypes';

export const useConsultationFormHandler = () => {
  const [formData, setFormData] = useState<any>({});
  
  const {
    createConsultation,
    updateConsultation,
    handleSaveConsultation,
    isLoading,
    isSubmitting
  } = useSaveConsultation();

  const handleFormSubmit = async (data: ConsultationCreateInput) => {
    return await createConsultation(data);
  };

  const handleFormUpdate = async (id: string, data: ConsultationUpdateInput) => {
    return await handleSaveConsultation(id, data);
  };

  return {
    formData,
    setFormData,
    handleFormSubmit,
    handleFormUpdate,
    handleSaveConsultation,
    createConsultation,
    updateConsultation,
    isLoading,
    isSubmitting
  };
};
