
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
import { Patient, PatientGoals } from '@/types/patient';

interface PatientContextType {
  patients: Patient[];
  activePatient: Patient | null;
  loading: boolean;
  isLoading: boolean; // Add alias
  error: string | null;
  filters: {
    search: string;
    status: string;
  };
  sessionData: {
    consultationActive: boolean;
    currentStep: string;
    lastActivity: Date | null;
  };
  setFilters: (filters: { search: string; status: string }) => void;
  loadPatients: () => Promise<void>;
  setActivePatient: (patient: Patient | null) => void;
  startPatientSession: (patient: Patient) => void;
  savePatient: (patientData: Partial<Patient>) => Promise<{ success: boolean; data?: Patient; error?: string }>;
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

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState({ search: '', status: '' });
  const [sessionData, setSessionData] = useState({
    consultationActive: false,
    currentStep: '',
    lastActivity: null as Date | null,
  });
  const { user } = useAuth();

  const setFilters = useCallback((newFilters: { search: string; status: string }) => {
    setFiltersState(newFilters);
  }, []);

  const loadPatients = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const query = supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id);

      if (filters.status && filters.status !== '' && filters.status !== 'all') {
        query.eq('status', filters.status);
      }

      if (filters.search) {
        query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Patient type
      const transformedData: Patient[] = (data || []).map(patient => {
        // Calculate age if birth_date exists
        let age = undefined;
        if (patient.birth_date) {
          const birthDate = new Date(patient.birth_date);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        return {
          ...patient,
          gender: patient.gender as 'male' | 'female' | 'other',
          goals: patient.goals as PatientGoals,
          address: patient.address || '',
          secondaryPhone: patient.secondaryphone || '',
          age,
          last_appointment: undefined // This will be loaded separately if needed
        };
      });

      setPatients(transformedData);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  const startPatientSession = useCallback((patient: Patient) => {
    setActivePatient(patient);
    setSessionData({
      consultationActive: true,
      currentStep: 'patient_data',
      lastActivity: new Date(),
    });
  }, []);

  const savePatient = useCallback(async (patientData: Partial<Patient>): Promise<{ success: boolean; data?: Patient; error?: string }> => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };
    
    try {
      // Convert Patient data to match database schema
      const dbPatient = {
        ...patientData,
        address: typeof patientData.address === 'object' 
          ? JSON.stringify(patientData.address) 
          : patientData.address || '',
        goals: patientData.goals ? JSON.stringify(patientData.goals) as Json : null,
        secondaryphone: patientData.secondaryPhone,
        user_id: user.id
      };

      // Remove fields that don't exist in database
      const {
        secondaryPhone,
        last_appointment,
        age,
        weight,
        height,
        ...cleanDbPatient
      } = dbPatient;

      if (patientData.id) {
        const result = await PatientService.updatePatient(patientData.id, cleanDbPatient);
        if (!result.success) {
          return { success: false, error: result.error || 'Failed to update patient' };
        }
        return { success: true, data: result.data };
      } else {
        const result = await PatientService.createPatient(cleanDbPatient);
        if (!result.success) {
          return { success: false, error: result.error || 'Failed to create patient' };
        }
        return { success: true, data: result.data };
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      return { success: false, error: error.message };
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
        const goals = patientData.goals ? JSON.stringify(patientData.goals) as Json : null;
        
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
      const goals = updates.goals ? JSON.stringify(updates.goals) as Json : undefined;
      
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
    isLoading: loading, // Add alias
    error,
    filters,
    sessionData,
    setFilters,
    loadPatients,
    setActivePatient,
    startPatientSession,
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

// Export the Patient interface from this context for backward compatibility
export type { Patient, PatientGoals };
