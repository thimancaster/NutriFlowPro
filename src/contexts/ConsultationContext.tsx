
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientProvider, usePatient } from './PatientContext';
import { ConsultationDataProvider, useConsultationData } from './ConsultationDataContext';
import { MealPlanProvider, useMealPlan } from './MealPlanContext';
import { Patient } from '@/types';

interface ConsultationContextType {
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  consultationData: any;
  setConsultationData: (data: any) => void;
  mealPlan: any;
  setMealPlan: (plan: any) => void;
  isConsultationActive: boolean;
  startConsultation: (patient: Patient) => void;
  endConsultation: () => void;
  saveConsultation: () => Promise<string | undefined>;
  saveMealPlan: () => Promise<string | undefined>;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

// Inner provider that uses the individual context hooks
const InnerConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { activePatient, setActivePatient, endPatientSession } = usePatient();
  const { consultationData, setConsultationData, saveConsultation } = useConsultationData();
  const { mealPlan, setMealPlan, saveMealPlan } = useMealPlan();

  const startConsultation = (patient: Patient) => {
    setActivePatient(patient);
    setConsultationData(null);
    setMealPlan(null);
    navigate(`/consultation?patientId=${patient.id}`);
  };

  const endConsultation = () => {
    setActivePatient(null);
    setConsultationData(null);
    setMealPlan(null);
    endPatientSession();
  };

  return (
    <ConsultationContext.Provider
      value={{
        activePatient,
        setActivePatient,
        consultationData,
        setConsultationData,
        mealPlan,
        setMealPlan,
        isConsultationActive: !!activePatient,
        startConsultation,
        endConsultation,
        saveConsultation,
        saveMealPlan
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

// Main provider that combines all three context providers
export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PatientProvider>
      <ConsultationDataProvider>
        <MealPlanProvider>
          <InnerConsultationProvider>
            {children}
          </InnerConsultationProvider>
        </MealPlanProvider>
      </ConsultationDataProvider>
    </PatientProvider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
