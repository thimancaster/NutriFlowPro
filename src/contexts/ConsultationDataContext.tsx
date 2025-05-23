
import React, { createContext, useContext, useState } from 'react';
import { ConsultationData } from '@/types';
import { logger } from '@/utils/logger';

// Create a basic ConsultationDataContext
const ConsultationDataContext = createContext<{
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
}>({
  consultationData: null,
  setConsultationData: () => {}
});

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  
  const handleSetConsultationData = (newData: ConsultationData | null) => {
    if (newData) {
      // Update the logger call to use proper object format
      logger.info('Setting consultation data:', { details: newData });
    }
    setConsultationData(newData);
  };
  
  return (
    <ConsultationDataContext.Provider value={{ 
      consultationData, 
      setConsultationData: handleSetConsultationData 
    }}>
      {children}
    </ConsultationDataContext.Provider>
  );
};

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (context === undefined) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};
