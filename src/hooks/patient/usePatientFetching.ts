
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';

export const usePatientQuery = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      
      // Transform database field to match Patient interface
      const patient: Patient = {
        ...data,
        secondaryPhone: data.secondaryphone,
        gender: data.gender as 'male' | 'female' | 'other' | undefined,
        status: data.status as 'active' | 'archived',
        measurements: typeof data.measurements === 'string' 
          ? JSON.parse(data.measurements) 
          : data.measurements || {},
        goals: typeof data.goals === 'string' 
          ? JSON.parse(data.goals) 
          : data.goals || {},
        address: typeof data.address === 'string' && data.address.startsWith('{')
          ? JSON.parse(data.address)
          : data.address,
      };
      
      return patient;
    },
    enabled: !!patientId,
  });
};

export const usePatientsQuery = (userId: string | undefined, filters?: {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['patients', userId, filters],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      let query = supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform database fields to match Patient interface
      const patients: Patient[] = (data || []).map(patient => ({
        ...patient,
        secondaryPhone: patient.secondaryphone,
        gender: patient.gender as 'male' | 'female' | 'other' | undefined,
        status: patient.status as 'active' | 'archived',
        measurements: typeof patient.measurements === 'string' 
          ? JSON.parse(patient.measurements) 
          : patient.measurements || {},
        goals: typeof patient.goals === 'string' 
          ? JSON.parse(patient.goals) 
          : patient.goals || {},
        address: typeof patient.address === 'string' && patient.address && patient.address.startsWith('{')
          ? JSON.parse(patient.address)
          : patient.address,
      }));
      
      return patients;
    },
    enabled: !!userId,
  });
};

export const usePatientCalculationsQuery = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['patient-calculations', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      
      const { data, error } = await supabase
        .from('calculation_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
};

export const usePatientMealPlansQuery = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['patient-meal-plans', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
};

// Hook principal que utiliza os serviços de paciente
export const usePatientFetching = (userId?: string) => {
  const { data: patients = [], isLoading, error, refetch } = usePatientsQuery(userId);
  
  const fetchPatients = async (filters?: any) => {
    await refetch();
    return {
      patients,
      total: patients.length,
      page: 1,
      totalPages: 1,
      limit: 10
    };
  };

  return {
    patients,
    isLoading,
    error: error?.message,
    fetchPatients
  };
};
