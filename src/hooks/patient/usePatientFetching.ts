
import { useState, useEffect, useCallback, useRef } from 'react';
import { Patient, PatientFilters } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Helper function to safely parse JSON fields
const safeParseJson = (jsonField: Json | null, defaultValue: any = {}) => {
  if (!jsonField) return defaultValue;
  if (typeof jsonField === 'object') return jsonField;
  try {
    return JSON.parse(jsonField as string) || defaultValue;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return defaultValue;
  }
};

/**
 * Hook for fetching patient data
 */
export const usePatientFetching = (
  userId: string | undefined,
  filters: PatientFilters,
  pagination: { limit: number, offset: number }
) => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);
  
  // Use a ref for tracking fetch operations
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef<number | null>(null);
  
  // Clear fetch timeout to prevent memory leaks
  const clearFetchTimeout = useCallback(() => {
    if (fetchTimeoutRef.current !== null) {
      window.clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  }, []);
  
  // Debounced fetch function
  const debouncedFetch = useCallback((delay = 300) => {
    clearFetchTimeout();
    
    fetchTimeoutRef.current = window.setTimeout(() => {
      fetchPatients();
    }, delay);
    
    return () => clearFetchTimeout();
  }, [clearFetchTimeout]);
  
  const fetchPatients = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (!userId || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      console.log("Fetching patients with filters:", filters);
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      // If we need status filtering
      if (filters.status && filters.status !== 'all') {
        // Use placeholder for status if it's not in the database yet
        // query = query.eq('status', filters.status);
      }
      
      // Date filters if provided
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      // Apply user_id filter to only show the user's patients
      query = query.eq('user_id', userId);
      
      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortDirection === 'asc' 
        });
      }
      
      // Apply pagination
      const { limit, offset } = pagination;
      if (limit && offset !== undefined) {
        query = query.range(offset, offset + limit - 1);
      }
      
      console.log("Executing query:", JSON.stringify(query));
      const { data, error, count } = await query;
      
      if (error) throw error;
      console.log("Query returned data:", data?.length, "items");
      
      // Transform data to match Patient type
      const transformedData: Patient[] = data?.map(patient => {
        try {
          const measurementsData = safeParseJson(patient.measurements, {});
          const goalsData = safeParseJson(patient.goals, {});
          const addressData = typeof patient.address === 'string' ? 
            safeParseJson(patient.address, {}) : patient.address || {};
          
          return {
            ...patient,
            status: 'active', // Add a default status if not present in the database
            goals: {
              objective: goalsData.objective || '',
              profile: goalsData.profile || '',
            },
            measurements: {
              weight: measurementsData.weight || 0,
              height: measurementsData.height || 0,
            },
            address: addressData
          };
        } catch (err) {
          console.error("Error transforming patient data:", err);
          // Return a basic patient object to prevent the entire list from failing
          return {
            ...patient,
            id: patient.id,
            name: patient.name || 'Unknown Patient',
            status: 'active', // Provide default status
            goals: { objective: '', profile: '' },
            measurements: { weight: 0, height: 0 }
          };
        }
      }) || [];
      
      setPatients(transformedData);
      setTotalPatients(count || 0);
      
      return { patients: transformedData, totalItems: count || 0 };
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err as Error);
      setIsError(true);
      
      toast({
        title: 'Erro',
        description: `Falha ao carregar pacientes: ${(err as Error).message}`,
        variant: 'destructive',
      });
      
      return { patients: [], totalItems: 0 };
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, filters, pagination, toast]);

  // Effect for initial fetch and cleanup
  useEffect(() => {
    if (userId) {
      debouncedFetch(500);
    }
    
    return () => {
      clearFetchTimeout();
    };
  }, [userId, debouncedFetch, clearFetchTimeout]);

  return {
    patients,
    totalPatients,
    isLoading,
    error,
    isError,
    fetchPatients,
    debouncedFetch,
    clearFetchTimeout
  };
};
