
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, ConsultationData } from '@/types';
import { useAuth } from './auth/AuthContext';
import { ClinicalWorkflowStep } from '@/types/clinical';

interface ConsultationDataContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  updateConsultationData: (updates: Partial<ConsultationData>) => void;
  clearConsultationData: () => void;
  startNewConsultation: (patient: Patient) => Promise<void>;
  isConsultationActive: boolean;
  
  // Clinical workflow properties
  currentStep: ClinicalWorkflowStep;
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  isLoading: boolean;
  patientHistoryData: any;
  autoSave: () => Promise<void>;
  completeConsultation: () => Promise<void>;
  loadPatientHistory: (patientId: string) => Promise<void>;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (!context) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};

interface ConsultationDataProviderProps {
  children: ReactNode;
}

export const ConsultationDataProvider: React.FC<ConsultationDataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>('patient-selection');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientHistoryData, setPatientHistoryData] = useState<any>(null);

  // Clear consultation data when user logs out
  useEffect(() => {
    if (!user) {
      setSelectedPatient(null);
      setConsultationData(null);
      setCurrentStep('patient-selection');
    }
  }, [user]);

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultationData(current => {
      if (!current) return null;
      return { ...current, ...updates };
    });
  };

  const clearConsultationData = () => {
    setConsultationData(null);
    setSelectedPatient(null);
    setCurrentStep('patient-selection');
  };

  const startNewConsultation = async (patient: Patient) => {
    console.log('Starting new consultation for patient:', patient.name);
    
    setSelectedPatient(patient);
    
    // Initialize basic consultation data structure
    const newConsultationData: ConsultationData = {
      id: `temp-${Date.now()}`,
      patient_id: patient.id,
      weight: 0,
      height: 0,
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totalCalories: 0,
      gender: patient.gender === 'male' ? 'M' : 'F',
      activity_level: 'moderado',
      patient: {
        name: patient.name,
        id: patient.id
      },
      results: null
    };
    
    setConsultationData(newConsultationData);
  };

  const autoSave = async () => {
    if (!consultationData) return;
    
    setIsSaving(true);
    try {
      // Simulate auto-save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const completeConsultation = async () => {
    if (!consultationData) return;
    
    setIsSaving(true);
    try {
      // Implement consultation completion logic
      await autoSave();
      console.log('Consultation completed');
    } catch (error) {
      console.error('Failed to complete consultation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadPatientHistory = async (patientId: string) => {
    setIsLoading(true);
    try {
      // Simulate loading patient history
      await new Promise(resolve => setTimeout(resolve, 500));
      setPatientHistoryData({ patientId, loaded: true });
    } catch (error) {
      console.error('Failed to load patient history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isConsultationActive = selectedPatient !== null && consultationData !== null;

  const value: ConsultationDataContextType = {
    selectedPatient,
    setSelectedPatient,
    consultationData,
    setConsultationData,
    updateConsultationData,
    clearConsultationData,
    startNewConsultation,
    isConsultationActive,
    currentStep,
    setCurrentStep,
    isSaving,
    lastSaved,
    isLoading,
    patientHistoryData,
    autoSave,
    completeConsultation,
    loadPatientHistory
  };

  return (
    <ConsultationDataContext.Provider value={value}>
      {children}
    </ConsultationDataContext.Provider>
  );
};
