import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { PatientService } from '@/services/patient/PatientService';
import { useAuth } from '../auth/AuthContext';

// Define the shape of our patient data
export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  cpf?: string;
  birth_date?: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  status?: 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
  goals?: PatientGoals;
  last_appointment?: string;
}

export interface PatientGoals {
  objective?: string;
  activityLevel?: string;
  profile?: string;
}

interface PatientContextType {
  patients: Patient[];
  activePatient: Patient | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
  };
  setFilters: (filters: { search: string; status: string }) => void;
  loadPatients: () => Promise<void>;
  setActivePatient: (patient: Patient | null) => void;
  savePatient: (patientData: Partial<Patient>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<void>;
  createPatient: (patientData: Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Patient | null>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<Patient | null>;
  clearActivePatient: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

interface PatientProviderProps {
  children: React.ReactNode;
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const { user } = useAuth();

  const loadPatients = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const query = supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id);

      if (filters.status && filters.status !== '') {
        if (filters.status === 'active') {
          query.eq('status', 'active');
        } else if (filters.status === 'archived') {
          query.eq('status', 'archived');
        }
      }

      if (filters.search) {
        query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Patient type
      const transformedData: Patient[] = (data || []).map(patient => ({
        ...patient,
        gender: patient.gender as 'male' | 'female' | 'other',
        goals: patient.goals as PatientGoals,
        address: patient.address || '',
        secondaryPhone: patient.secondaryphone || '',
        last_appointment: undefined // This will be loaded separately if needed
      }));

      setPatients(transformedData);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  const savePatient = useCallback(async (patientData: Partial<Patient>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      // Convert Patient data to match database schema
      const dbPatient = {
        ...patientData,
        address: typeof patientData.address === 'object' 
          ? JSON.stringify(patientData.address) 
          : patientData.address || '',
        goals: patientData.goals ? JSON.stringify(patientData.goals) : null,
        secondaryphone: patientData.secondaryPhone,
        user_id: user.id
      };

      // Remove fields that don't exist in database
      const {
        secondaryPhone,
        last_appointment,
        ...cleanDbPatient
      } = dbPatient;

      if (patientData.id) {
        const result = await PatientService.updatePatient(patientData.id, cleanDbPatient);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update patient');
        }
        return result.data;
      } else {
        const result = await PatientService.createPatient(cleanDbPatient);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create patient');
        }
        return result.data;
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      throw error;
    }
  }, [user?.id]);

  const deletePatient = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await PatientService.deletePatient(id);
      setPatients(patients.filter((patient) => patient.id !== id));
      if (activePatient?.id === id) {
        setActivePatient(null);
      }
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patients, activePatient]);

  const createPatient = useCallback(
    async (
      patientData: Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ): Promise<Patient | null> => {
      setLoading(true);
      setError(null);
      try {
        // Ensure goals is not undefined before stringifying
        const goals = patientData.goals ? JSON.stringify(patientData.goals) : null;
        
        const newPatient = {
          ...patientData,
          user_id: user?.id,
          goals: goals,
        };
        
        const { data, error } = await supabase
          .from('patients')
          .insert([newPatient])
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our Patient type
        const transformedData: Patient = {
          ...data,
          gender: data.gender as 'male' | 'female' | 'other',
          goals: data.goals as PatientGoals,
          address: data.address || '',
          secondaryPhone: data.secondaryphone || '',
          last_appointment: undefined // This will be loaded separately if needed
        };
        
        setPatients([...patients, transformedData]);
        return transformedData;
      } catch (err: any) {
        console.error('Error creating patient:', err);
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, patients]
  );

  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>): Promise<Patient | null> => {
    setLoading(true);
    setError(null);
    try {
      // Ensure goals is not undefined before stringifying
      const goals = updates.goals ? JSON.stringify(updates.goals) : undefined;
      
      const { data, error } = await supabase
        .from('patients')
        .update({ ...updates, goals })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match our Patient type
      const transformedData: Patient = {
        ...data,
        gender: data.gender as 'male' | 'female' | 'other',
        goals: data.goals as PatientGoals,
        address: data.address || '',
        secondaryPhone: data.secondaryphone || '',
        last_appointment: undefined // This will be loaded separately if needed
      };
      
      setPatients(
        patients.map((patient) => (patient.id === id ? transformedData : patient))
      );
      
      if (activePatient?.id === id) {
        setActivePatient(transformedData);
      }
      
      return transformedData;
    } catch (err: any) {
      console.error('Error updating patient:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [patients, activePatient]);

  const clearActivePatient = useCallback(() => {
    setActivePatient(null);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const value: PatientContextType = {
    patients,
    activePatient,
    loading,
    error,
    filters,
    setFilters,
    loadPatients,
    setActivePatient,
    savePatient,
    deletePatient,
    createPatient,
    updatePatient,
    clearActivePatient,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};
