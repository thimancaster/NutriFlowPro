
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ConsultationData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

interface ConsultationDataContextType {
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData) => void;
  clearConsultationData: () => void;
  updateConsultationField: <K extends keyof ConsultationData>(
    field: K,
    value: ConsultationData[K]
  ) => void;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | null>(null);

export const ConsultationDataProvider = ({ children }: { children: ReactNode }) => {
  const [consultationData, setConsultationDataState] = useState<ConsultationData | null>(null);

  // Set consultation data
  const setConsultationData = (data: ConsultationData) => {
    logger.info('Setting consultation data:', data);
    setConsultationDataState(data);
    
    try {
      // Save to sessionStorage
      sessionStorage.setItem('consultationData', JSON.stringify(data));
    } catch (error) {
      logger.error('Error saving consultation data to sessionStorage:', error);
    }
  };

  // Clear consultation data
  const clearConsultationData = () => {
    setConsultationDataState(null);
    sessionStorage.removeItem('consultationData');
  };

  // Update a specific field in consultation data
  const updateConsultationField = <K extends keyof ConsultationData>(
    field: K,
    value: ConsultationData[K]
  ) => {
    if (!consultationData) {
      // Create new consultation data if none exists
      const newData: ConsultationData = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        // Add any other required fields
        [field]: value,
      } as unknown as ConsultationData;
      
      setConsultationData(newData);
      return;
    }
    
    // Update existing consultation data
    const updatedData = {
      ...consultationData,
      [field]: value,
    };
    
    setConsultationData(updatedData);
  };

  // Load from sessionStorage on initial render
  React.useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('consultationData');
      if (savedData) {
        setConsultationDataState(JSON.parse(savedData));
      }
    } catch (error) {
      logger.error('Error loading consultation data from sessionStorage:', error);
    }
  }, []);

  const value = {
    consultationData,
    setConsultationData,
    clearConsultationData,
    updateConsultationField,
  };

  return (
    <ConsultationDataContext.Provider value={value}>
      {children}
    </ConsultationDataContext.Provider>
  );
};

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (!context) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};
