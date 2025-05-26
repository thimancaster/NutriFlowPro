
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters, PatientListResponse } from '@/types';

interface UsePatientFetchingResult {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  fetchPatients: (filters: PatientFilters) => Promise<PatientListResponse>;
}

export const usePatientFetching = (userId?: string): UsePatientFetchingResult => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (filters: PatientFilters): Promise<PatientListResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('patients')
        .select('*');

      // Apply user filter if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Apply status filter - only filter if status is specifically 'active' or 'archived'
      if (filters.status === 'active' || filters.status === 'archived') {
        query = query.eq('status', filters.status);
      }

      // Apply search filter
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply sorting
      if (filters.sortBy) {
        const sortOrder = filters.sortOrder === 'asc' ? true : false;
        query = query.order(filters.sortBy, { ascending: sortOrder });
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit - 1;
        query = query.range(startIndex, endIndex);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data to match Patient type
      const transformedPatients: Patient[] = data ? data.map(patient => ({
        ...patient,
        status: (patient.status as 'active' | 'archived') || 'active',
        gender: (patient.gender as 'male' | 'female' | 'other') || undefined,
        // Handle measurements conversion safely
        measurements: typeof patient.measurements === 'object' && patient.measurements !== null 
          ? patient.measurements as any
          : {} as any,
        // Handle goals conversion safely
        goals: typeof patient.goals === 'object' && patient.goals !== null
          ? patient.goals as any
          : {} as any,
        // Calculate age from birth_date if not present
        age: patient.birth_date 
          ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear()
          : undefined,
        // Ensure all required fields have proper types
        birth_date: patient.birth_date || undefined,
        email: patient.email || undefined,
        phone: patient.phone || undefined,
        cpf: patient.cpf || undefined,
        address: patient.address || undefined,
        notes: patient.notes || undefined,
        secondaryPhone: patient.secondaryPhone || undefined,
        created_at: patient.created_at || undefined,
        updated_at: patient.updated_at || undefined,
        user_id: patient.user_id || undefined
      })) : [];

      const response: PatientListResponse = {
        patients: transformedPatients,
        total: count || transformedPatients.length,
        page: filters.page || 1,
        totalPages: Math.ceil((count || transformedPatients.length) / (filters.limit || 10)),
        limit: filters.limit || 10
      };

      setPatients(transformedPatients);
      return response;
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError(error.message);
      return {
        patients: [],
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 10
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { patients, isLoading, error, fetchPatients };
};
