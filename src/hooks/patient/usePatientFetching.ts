
import { useState, useEffect, useCallback, useRef } from 'react';
import { Patient, PatientFilters } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

interface UsePatientFetchingReturn {
  patients: Patient[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationInfo;
  refetch: () => Promise<void>;
  fetchPatients: (filters: PatientFilters) => Promise<void>;
}

export const usePatientFetching = (userId?: string): UsePatientFetchingReturn => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  });
  
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPatients = useCallback(async (filters: PatientFilters) => {
    if (!userId) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.status && filters.status !== '') {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);

      const { data, error: supabaseError, count } = await query.abortSignal(
        abortControllerRef.current.signal
      );

      if (supabaseError) throw supabaseError;

      // Process the data to match Patient type
      const processedPatients: Patient[] = (data || []).map(patient => ({
        ...patient,
        status: (patient.status as 'active' | 'archived') || 'active',
        gender: (patient.gender as 'male' | 'female' | 'other') || undefined,
        goals: typeof patient.goals === 'string' 
          ? JSON.parse(patient.goals) 
          : (patient.goals || {}),
        measurements: typeof patient.measurements === 'string' 
          ? JSON.parse(patient.measurements) 
          : (patient.measurements || {}),
        address: patient.address || undefined
      }));

      setPatients(processedPatients);
      
      setPagination({
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalCount: count || 0,
        pageSize: limit
      });

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching patients:', err);
        setError(err);
        toast({
          title: "Erro ao carregar pacientes",
          description: "Não foi possível carregar a lista de pacientes.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const refetch = useCallback(async () => {
    await fetchPatients({
      status: '',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 10
    });
  }, [fetchPatients]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    patients,
    isLoading,
    error,
    pagination,
    refetch,
    fetchPatients
  };
};
