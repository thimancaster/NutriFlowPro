
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
        secondaryPhone: data.secondaryphone, // Map database field to interface field
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
        secondaryPhone: patient.secondaryphone, // Map database field to interface field
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
