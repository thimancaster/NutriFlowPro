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
  
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'active', // Changed from 'all' to 'active'
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });

  const { user } = useAuth();

  const startPatientSession = (patient: Patient) => {
    setActivePatient(patient);
    loadPatientHistory(patient.id);
  };

  const endPatientSession = () => {
    setActivePatient(null);
    setPatientHistory([]);
  };

  const loadPatientHistory = useCallback(async (patientId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('patient_history')
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

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating patient:', error);
      } else {
        // Optimistically update the patient in the local state
        setPatients(prevPatients =>
          prevPatients.map(patient => (patient.id === id ? { ...patient, ...data } : patient))
        );
        if (activePatient && activePatient.id === id) {
          setActivePatient({ ...activePatient, ...data });
        }
        await loadPatients(); // Refresh patients
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
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFilters(initialState);
  };

  const loadPatients = useCallback(async (newFilters?: PatientFilters) => {
    setIsLoading(true);
    try {
      const activeFilters = newFilters || filters;
      
      // Build query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });

      // Apply filters
      if (activeFilters.search) {
        query = query.ilike('name', `%${activeFilters.search}%`);
      }

      if (activeFilters.status && activeFilters.status !== '') { // Fixed comparison
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

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error loading patients:', error);
      } else {
        setPatients(data || []);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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
    filters,
    totalCount,
    setActivePatient,
    startPatientSession,
    endPatientSession,
    loadPatients,
    updatePatient,
    deletePatient,
    setFilters,
    resetFilters
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
