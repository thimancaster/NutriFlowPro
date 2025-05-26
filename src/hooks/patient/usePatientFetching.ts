import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters, PatientListResponse } from '@/types';

interface UsePatientFetchingResult {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  fetchPatients: (filters: PatientFilters) => Promise<void>;
}

export const usePatientFetching = (): UsePatientFetchingResult => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (filters: PatientFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('patients')
        .select('*');

      // Apply status filter - handle empty string as 'all'
      if (filters.status && filters.status !== '' && filters.status !== 'all') {
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

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
      const transformedPatients: Patient[] = data ? data.map(patient => ({
        ...patient,
        status: patient.status || 'active',
      })) : [];

      setPatients(transformedPatients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError(error.message);
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { patients, isLoading, error, fetchPatients };
};
