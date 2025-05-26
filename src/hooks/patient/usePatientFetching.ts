
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

      // Apply status filter - handle empty string and 'all' as no filter
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

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data to match Patient type
      const transformedPatients: Patient[] = data ? data.map(patient => ({
        ...patient,
        status: (patient.status as 'active' | 'archived') || 'active',
        gender: (patient.gender as 'male' | 'female' | 'other') || undefined,
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
