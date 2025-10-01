/**
 * DEPRECATED - This context has been replaced by ClinicalWorkflowContext
 * This file exists only for backward compatibility during migration
 * All new code should use ClinicalWorkflowContext instead
 */

import { createContext, useContext, ReactNode } from 'react';
import { useClinicalWorkflow } from './ClinicalWorkflowContext';

// Legacy interface for backward compatibility
interface ConsultationContextType {
  activePatient: any;
  setActivePatient: (patient: any) => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider = ({ children }: { children: ReactNode }) => {
  const { state, setActivePatient } = useClinicalWorkflow();
  
  const value = {
    activePatient: state.activePatient,
    setActivePatient,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider');
  }
  return context;
};
