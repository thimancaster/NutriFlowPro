
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ConsultationData, Patient } from '@/types';
import { PatientHistoryData } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientContextType } from './types';

interface ConsultationDataState {
  consultationData: ConsultationData | null;
  isConsultationActive: boolean;
  currentStep: string;
  isSaving: boolean;
  lastSaved: Date | null;
}

interface ConsultationDataContextType {
  state: ConsultationDataState;
  consultationData: ConsultationData | null;
  isConsultationActive: boolean;
  currentStep: string;
  isSaving: boolean;
  lastSaved: Date | null;
  setCurrentStep: (step: string) => void;
  updateConsultationData: (data: Partial<ConsultationData>) => void;
  completeConsultation: () => Promise<void>;
  autoSave: () => Promise<void>;
  reset: () => void;
  isLoading: boolean;
  startNewConsultation: (patient: Patient) => Promise<void>;
  // Legacy compatibility
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  patientHistoryData: PatientHistoryData;
  setConsultationData: (data: ConsultationData | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Patient state
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  
  // Session data
  const [sessionData, setSessionData] = useState({
    consultationActive: false,
    currentStep: 'patient-selection',
    lastActivity: null as Date | null,
  });

  // Current filters
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });

  const startPatientSession = useCallback((patient: Patient) => {
    setActivePatient(patient);
    setSelectedPatientId(patient.id);
    setSessionData(prev => ({
      ...prev,
      consultationActive: true,
      lastActivity: new Date()
    }));
    addRecentPatient(patient);
  }, []);

  const endPatientSession = useCallback(() => {
    setActivePatient(null);
    setSelectedPatientId(null);
    setSessionData(prev => ({
      ...prev,
      consultationActive: false,
      lastActivity: new Date()
    }));
  }, []);

  const loadPatientById = useCallback(async (patientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      
      if (data) {
        const patient = data as Patient;
        setActivePatient(patient);
        setSelectedPatientId(patient.id);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPatientHistory = useCallback(async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('anthropometry')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPatientHistory(data || []);
    } catch (err) {
      console.error('Error loading patient history:', err);
    }
  }, []);

  const addRecentPatient = useCallback((patient: Patient) => {
    setRecentPatients(prev => {
      const filtered = prev.filter(p => p.id !== patient.id);
      return [patient, ...filtered].slice(0, 5);
    });
  }, []);

  const updateSessionData = useCallback((data: Partial<typeof sessionData>) => {
    setSessionData(prev => ({ ...prev, ...data }));
  }, []);

  const savePatient = useCallback(async (patientData: Partial<Patient>) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoading(true);
      
      const dataToSave = {
        ...patientData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('patients')
        .upsert(dataToSave)
        .select()
        .single();

      if (error) throw error;

      const savedPatient = data as Patient;
      
      // Update local state
      if (patientData.id) {
        setPatients(prev => prev.map(p => p.id === savedPatient.id ? savedPatient : p));
      } else {
        setPatients(prev => [savedPatient, ...prev]);
        setTotalPatients(prev => prev + 1);
      }

      return { success: true, data: savedPatient };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refreshPatients = useCallback(async (filters = currentFilters) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setPatients(data || []);
      setTotalPatients(count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentFilters]);

  const updateFilters = useCallback(async (newFilters: Partial<typeof currentFilters>) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setCurrentFilters(updatedFilters);
    await refreshPatients(updatedFilters);
  }, [currentFilters, refreshPatients]);

  // Load initial patients
  useEffect(() => {
    if (user?.id) {
      refreshPatients();
    }
  }, [user?.id]);

  const contextValue: PatientContextType = {
    // State
    activePatient,
    isPatientActive: !!activePatient,
    selectedPatientId,
    recentPatients,
    patients,
    totalPatients,
    isLoading,
    error,
    sessionData,
    patientHistoryData: [],
    patientHistory,
    
    // Actions
    setActivePatient,
    startPatientSession,
    endPatientSession,
    loadPatientById,
    loadPatientHistory,
    addRecentPatient,
    updateSessionData,
    savePatient,
    refreshPatients,
    updateFilters,
    currentFilters
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
