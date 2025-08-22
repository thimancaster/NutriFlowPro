
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Patient, PatientFilters } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

interface PatientContextState {
  // Patient management
  activePatient: Patient | null;
  patients: Patient[];
  patientHistory: any[];
  
  // Loading states
  isLoading: boolean;
  isLoadingHistory: boolean;
  
  // Session data
  sessionData: {
    consultationActive: boolean;
    currentStep: string;
    lastActivity: Date | null;
  };
  
  // Filters and pagination
  filters: PatientFilters;
  totalCount: number;
  
  // Actions
  setActivePatient: (patient: Patient | null) => void;
  startPatientSession: (patient: Patient) => void;
  endPatientSession: () => void;
  loadPatients: (filters?: PatientFilters) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  setFilters: (filters: PatientFilters) => void;
  resetFilters: () => void;
  savePatient: (patientData: Partial<Patient>) => Promise<{ success: boolean; data?: Patient; error?: string }>;
  refreshPatients: (filters?: PatientFilters) => Promise<void>;
  isPatientActive: boolean;
  loadPatientById: (patientId: string) => Promise<void>;
}

const PatientContext = createContext<PatientContextState | undefined>(undefined);

const initialState: PatientFilters = {
  search: '',
  status: 'active',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  limit: 10
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFiltersState] = useState<PatientFilters>({
    search: '',
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });

  const [sessionData] = useState({
    consultationActive: false,
    currentStep: 'initial',
    lastActivity: null as Date | null,
  });

  const { user } = useAuth();

  const isPatientActive = !!activePatient;

  const startPatientSession = (patient: Patient) => {
    setActivePatient(patient);
    loadPatientHistory(patient.id);
  };

  const endPatientSession = () => {
    setActivePatient(null);
    setPatientHistory([]);
  };

  const loadPatientById = useCallback(async (patientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error loading patient by ID:', error);
      } else if (data) {
        const transformedPatient = transformPatientData(data);
        setActivePatient(transformedPatient);
      }
    } catch (error) {
      console.error('Error loading patient by ID:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPatientHistory = useCallback(async (patientId: string) => {
    setIsLoadingHistory(true);
    try {
      // Use a generic query since patient_history table may not exist
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading patient history:', error);
      } else {
        setPatientHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const transformPatientData = (rawPatient: any): Patient => {
    return {
      id: rawPatient.id,
      name: rawPatient.name,
      email: rawPatient.email || '',
      phone: rawPatient.phone || '',
      secondaryPhone: rawPatient.secondaryphone || '',
      cpf: rawPatient.cpf || '',
      birth_date: rawPatient.birth_date || '',
      gender: (rawPatient.gender === 'male' || rawPatient.gender === 'female' || rawPatient.gender === 'other') 
        ? rawPatient.gender 
        : 'other',
      address: rawPatient.address || '',
      notes: rawPatient.notes || '',
      status: rawPatient.status === 'archived' ? 'archived' : 'active',
      goals: rawPatient.goals || {},
      created_at: rawPatient.created_at,
      updated_at: rawPatient.updated_at,
      user_id: rawPatient.user_id,
      last_appointment: rawPatient.last_appointment
    };
  };

  const savePatient = async (patientData: Partial<Patient>) => {
    setIsLoading(true);
    try {
      // Convert address to string if it's an object
      const processedData = {
        ...patientData,
        address: typeof patientData.address === 'object' 
          ? JSON.stringify(patientData.address) 
          : patientData.address
      };

      if (patientData.id) {
        // Update existing patient
        const { data, error } = await supabase
          .from('patients')
          .update(processedData)
          .eq('id', patientData.id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const transformedPatient = transformPatientData(data);
        return { success: true, data: transformedPatient };
      } else {
        // Create new patient
        const { data, error } = await supabase
          .from('patients')
          .insert(processedData)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const transformedPatient = transformPatientData(data);
        return { success: true, data: transformedPatient };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    setIsLoading(true);
    try {
      const processedData = {
        ...data,
        address: typeof data.address === 'object' 
          ? JSON.stringify(data.address) 
          : data.address
      };

      const { error } = await supabase
        .from('patients')
        .update(processedData)
        .eq('id', id);

      if (error) {
        console.error('Error updating patient:', error);
      } else {
        setPatients(prevPatients =>
          prevPatients.map(patient => (patient.id === id ? { ...patient, ...data } : patient))
        );
        if (activePatient && activePatient.id === id) {
          setActivePatient({ ...activePatient, ...data });
        }
        await loadPatients();
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting patient:', error);
      } else {
        setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
        if (activePatient && activePatient.id === id) {
          setActivePatient(null);
        }
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setFilters = (newFilters: PatientFilters) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFiltersState(initialState);
  };

  const loadPatients = useCallback(async (newFilters?: PatientFilters) => {
    setIsLoading(true);
    try {
      const activeFilters = newFilters || filters;
      
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });

      if (activeFilters.search) {
        query = query.ilike('name', `%${activeFilters.search}%`);
      }

      if (activeFilters.status && activeFilters.status !== 'active' && activeFilters.status !== 'archived') {
        // Handle invalid status values
      } else if (activeFilters.status) {
        query = query.eq('status', activeFilters.status);
      }

      if (activeFilters.sortBy) {
        query = query.order(activeFilters.sortBy, { ascending: activeFilters.sortOrder === 'asc' });
      }

      if (activeFilters.page && activeFilters.limit) {
        const startIndex = (activeFilters.page - 1) * activeFilters.limit;
        const endIndex = startIndex + activeFilters.limit - 1;
        query = query.range(startIndex, endIndex);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error loading patients:', error);
      } else {
        const transformedPatients = (data || []).map(transformPatientData);
        setPatients(transformedPatients);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const refreshPatients = loadPatients;

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user, loadPatients]);

  const contextValue: PatientContextState = {
    activePatient,
    patients,
    patientHistory,
    isLoading,
    isLoadingHistory,
    sessionData,
    filters,
    totalCount,
    setActivePatient,
    startPatientSession,
    endPatientSession,
    loadPatients,
    updatePatient,
    deletePatient,
    setFilters,
    resetFilters,
    savePatient,
    refreshPatients,
    isPatientActive,
    loadPatientById
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
