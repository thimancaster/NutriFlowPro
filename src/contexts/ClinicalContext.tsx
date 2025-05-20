
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Patient, Appointment, ConsultationData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Define workflow steps for patient care
export type ClinicalWorkflowStep = 
  | 'patient-selection' 
  | 'patient-info' 
  | 'anthropometry' 
  | 'nutritional-evaluation' 
  | 'meal-plan' 
  | 'recommendations'
  | 'follow-up';

export interface ClinicalContextType {
  // Active data
  activePatient: Patient | null;
  activeConsultation: ConsultationData | null;
  currentStep: ClinicalWorkflowStep;
  
  // State setters
  setActivePatient: (patient: Patient | null) => void;
  setActiveConsultation: (consultation: ConsultationData | null) => void;
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  
  // Workflow actions
  startNewConsultation: (patient: Patient) => Promise<void>;
  saveConsultationData: (data: Partial<ConsultationData>) => Promise<boolean>;
  completeConsultation: () => Promise<boolean>;
  resetWorkflow: () => void;
  
  // State indicators
  isConsultationActive: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

const ClinicalContext = createContext<ClinicalContextType | undefined>(undefined);

export const ClinicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>('patient-selection');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load from session storage on mount
  useEffect(() => {
    try {
      const storedPatient = sessionStorage.getItem('activePatient');
      const storedConsultation = sessionStorage.getItem('activeConsultation');
      const storedStep = sessionStorage.getItem('currentClinicalStep');
      
      if (storedPatient) {
        setActivePatient(JSON.parse(storedPatient));
      }
      
      if (storedConsultation) {
        setActiveConsultation(JSON.parse(storedConsultation));
      }
      
      if (storedStep) {
        setCurrentStep(storedStep as ClinicalWorkflowStep);
      }
    } catch (error) {
      console.error('Error loading clinical session data:', error);
    }
  }, []);
  
  // Update session storage when state changes
  useEffect(() => {
    if (activePatient) {
      sessionStorage.setItem('activePatient', JSON.stringify(activePatient));
    } else {
      sessionStorage.removeItem('activePatient');
    }
    
    if (activeConsultation) {
      sessionStorage.setItem('activeConsultation', JSON.stringify(activeConsultation));
    } else {
      sessionStorage.removeItem('activeConsultation');
    }
    
    sessionStorage.setItem('currentClinicalStep', currentStep);
  }, [activePatient, activeConsultation, currentStep]);
  
  // Start a new consultation for a patient
  const startNewConsultation = async (patient: Patient) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para iniciar uma consulta.",
        variant: "destructive"
      });
      return;
    }
    
    setActivePatient(patient);
    
    // Create initial consultation data
    const newConsultation: ConsultationData = {
      id: uuidv4(),
      patient_id: patient.id,
      user_id: user.id,
      date: new Date().toISOString(),
      weight: patient.measurements?.weight || 0,
      height: patient.measurements?.height || 0,
      age: patient.age || 0,
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      gender: patient.gender || 'female',
      activity_level: 'moderado',
      objective: patient.goals?.objective || 'manutenção',
      results: {
        bmr: 0,
        get: 0,
        vet: 0,
        adjustment: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }
    };
    
    setActiveConsultation(newConsultation);
    setCurrentStep('patient-info');
    
    try {
      // Save initial consultation data to database
      const { error } = await supabase
        .from('calculations')
        .insert({
          id: newConsultation.id,
          patient_id: patient.id,
          user_id: user.id,
          weight: patient.measurements?.weight || 0,
          height: patient.measurements?.height || 0,
          age: patient.age || 0,
          gender: patient.gender || 'female',
          activity_level: 'moderado',
          goal: patient.goals?.objective || 'manutenção',
          status: 'em_andamento',
          bmr: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          tdee: 0
        });
        
      if (error) {
        console.error('Error creating new consultation:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar uma nova consulta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting new consultation:', error);
    }
  };
  
  // Save consultation data
  const saveConsultationData = async (data: Partial<ConsultationData>): Promise<boolean> => {
    if (!activeConsultation || !user) return false;
    
    setIsSaving(true);
    
    try {
      // Update local state
      const updatedConsultation = {
        ...activeConsultation,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      setActiveConsultation(updatedConsultation);
      
      // Save to database
      const { error } = await supabase
        .from('calculations')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConsultation.id);
        
      if (error) {
        console.error('Error saving consultation data:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar os dados da consulta.",
          variant: "destructive"
        });
        return false;
      }
      
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error in saveConsultationData:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Complete consultation
  const completeConsultation = async (): Promise<boolean> => {
    if (!activeConsultation || !user) return false;
    
    setIsSaving(true);
    
    try {
      // Update consultation status in database
      const { error } = await supabase
        .from('calculations')
        .update({
          status: 'completo',
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConsultation.id);
        
      if (error) {
        console.error('Error completing consultation:', error);
        toast({
          title: "Erro",
          description: "Não foi possível finalizar a consulta.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update appointment if created from appointment
      if (activeConsultation.appointment_id) {
        await supabase
          .from('appointments')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', activeConsultation.appointment_id);
      }
      
      // Update patient's last_appointment date
      await supabase
        .from('patients')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConsultation.patient_id);
      
      toast({
        title: "Consulta finalizada",
        description: "A consulta foi finalizada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Error in completeConsultation:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset workflow
  const resetWorkflow = () => {
    setActivePatient(null);
    setActiveConsultation(null);
    setCurrentStep('patient-selection');
    sessionStorage.removeItem('activePatient');
    sessionStorage.removeItem('activeConsultation');
    sessionStorage.removeItem('currentClinicalStep');
  };
  
  return (
    <ClinicalContext.Provider
      value={{
        activePatient,
        activeConsultation,
        currentStep,
        setActivePatient,
        setActiveConsultation,
        setCurrentStep,
        startNewConsultation,
        saveConsultationData,
        completeConsultation,
        resetWorkflow,
        isConsultationActive: !!activeConsultation,
        isSaving,
        lastSaved
      }}
    >
      {children}
    </ClinicalContext.Provider>
  );
};

export const useClinical = () => {
  const context = useContext(ClinicalContext);
  if (context === undefined) {
    throw new Error('useClinical must be used within a ClinicalProvider');
  }
  return context;
};
