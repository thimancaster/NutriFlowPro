
import { useContext } from 'react';
import { ConsultationContext } from '@/contexts/ConsultationContext';

export const useSafeConsultation = () => {
  const context = useContext(ConsultationContext);
  
  // Retorna valores padrão se o context não estiver disponível
  if (!context) {
    return {
      activePatient: null,
      setActivePatient: () => {},
      consultationData: null,
      setConsultationData: () => {},
      currentStep: 'patient-selection' as const,
      setCurrentStep: () => {},
      isConsultationActive: false,
      clearConsultation: () => {},
      mealPlan: null
    };
  }
  
  return context;
};
